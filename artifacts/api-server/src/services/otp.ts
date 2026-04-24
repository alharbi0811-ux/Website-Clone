import { db } from "@workspace/db";
import { otpCodesTable, usersTable } from "@workspace/db";
import { eq, and, gt, lt } from "drizzle-orm";

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

/* ─── Phone validation ─── */
function validatePhone(phone: string): string {
  const cleaned = phone.trim().replace(/\s+/g, "");

  // Accept full E.164 format: + followed by 7–15 digits
  if (/^\+[1-9]\d{6,14}$/.test(cleaned)) return cleaned;

  // Accept Kuwait/Gulf shorthand without country code: 5xxxxxxx → +9655xxxxxxx
  if (/^[569]\d{7}$/.test(cleaned)) return `+965${cleaned}`;

  throw new Error(`رقم الهاتف غير صالح. استخدم الصيغة الدولية مثل: +96512345678`);
}

/* ─── Twilio Verify (preferred) ─── */
const VERIFY_SID = process.env.TWILIO_VERIFY_SERVICE_SID || "VAd135cffdf1dd94ecf0f1badd29fdaecf";

async function twilioVerifySend(phone: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token) {
    throw new Error("NO_TWILIO_CREDS");
  }

  const url = `https://verify.twilio.com/v2/Services/${VERIFY_SID}/Verifications`;
  const payload = new URLSearchParams({ To: phone, Channel: "sms" });

  console.log(`[OTP] → Twilio Verify send | phone=${phone} | service=${VERIFY_SID}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload,
  });

  const body = await res.json() as Record<string, unknown>;
  console.log(`[OTP] ← Twilio Verify response | status=${res.status} | sid=${body.sid ?? "?"} | to=${body.to ?? "?"} | status=${body.status ?? "?"}`);

  if (!res.ok) {
    const code = body.code ?? body.status ?? res.status;
    const msg  = body.message ?? body.error_message ?? "فشل الإرسال";
    console.error(`[OTP] ✗ Verify error | code=${code} | message=${msg}`);
    throw new Error(diagnoseTwilioError(Number(code), String(msg)));
  }

  if (body.status === "pending") {
    console.log(`[OTP] ✓ Verification created | status=pending → SMS dispatched`);
  } else {
    console.warn(`[OTP] ⚠ Unexpected status="${body.status}" (might still deliver)`);
  }
}

async function twilioVerifyCheck(phone: string, code: string): Promise<boolean> {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return false;

  const url = `https://verify.twilio.com/v2/Services/${VERIFY_SID}/VerificationChecks`;
  const payload = new URLSearchParams({ To: phone, Code: code });

  console.log(`[OTP] → Twilio Verify check | phone=${phone} | code=${code}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload,
  });

  const body = await res.json() as Record<string, unknown>;
  console.log(`[OTP] ← Verify check response | status=${res.status} | verification_status=${body.status}`);

  if (res.status === 404) {
    console.error("[OTP] ✗ Verification not found (expired or already used)");
    return false;
  }

  if (!res.ok) {
    console.error(`[OTP] ✗ Verify check error | ${JSON.stringify(body)}`);
    return false;
  }

  return body.status === "approved";
}

/* ─── Fallback: DB-based OTP (dev mode or no Twilio creds) ─── */
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function dbSendOtp(userId: number, phone: string): Promise<void> {
  const now = new Date();

  const [recent] = await db
    .select()
    .from(otpCodesTable)
    .where(and(eq(otpCodesTable.userId, userId), eq(otpCodesTable.used, false), gt(otpCodesTable.expiresAt, now)))
    .limit(1);

  if (recent) {
    const age = (now.getTime() - recent.createdAt.getTime()) / 1000;
    if (age < RESEND_COOLDOWN_SECONDS) {
      throw new Error(`انتظر ${Math.ceil(RESEND_COOLDOWN_SECONDS - age)} ثانية قبل طلب رمز جديد`);
    }
  }

  await db.delete(otpCodesTable).where(and(eq(otpCodesTable.userId, userId), eq(otpCodesTable.used, false)));

  const code = generateCode();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);
  await db.insert(otpCodesTable).values({ userId, code, expiresAt });

  console.log(`[OTP DEV] ✓ No Twilio creds → Code for ${phone}: ${code} (expires ${expiresAt.toISOString()})`);
}

async function dbVerifyOtp(userId: number, code: string): Promise<boolean> {
  const now = new Date();

  const [otp] = await db
    .select()
    .from(otpCodesTable)
    .where(and(eq(otpCodesTable.userId, userId), eq(otpCodesTable.used, false), gt(otpCodesTable.expiresAt, now)))
    .limit(1);

  if (!otp) {
    console.warn(`[OTP DEV] No valid OTP for userId=${userId}`);
    return false;
  }

  if (otp.attempts >= MAX_ATTEMPTS) {
    await db.update(otpCodesTable).set({ used: true }).where(eq(otpCodesTable.id, otp.id));
    throw new Error("تجاوزت الحد الأقصى للمحاولات، اطلب رمزاً جديداً");
  }

  if (otp.code !== code.trim()) {
    await db.update(otpCodesTable).set({ attempts: otp.attempts + 1 }).where(eq(otpCodesTable.id, otp.id));
    console.warn(`[OTP DEV] Wrong code for userId=${userId} | attempt=${otp.attempts + 1}/${MAX_ATTEMPTS}`);
    return false;
  }

  await db.update(otpCodesTable).set({ used: true }).where(eq(otpCodesTable.id, otp.id));
  return true;
}

/* ─── Public API ─── */

function useTwilioVerify(): boolean {
  return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
}

export async function sendOtp(userId: number, rawPhone: string): Promise<void> {
  const phone = validatePhone(rawPhone);

  if (useTwilioVerify()) {
    try {
      await twilioVerifySend(phone);
      return;
    } catch (err) {
      if (err instanceof Error && err.message !== "NO_TWILIO_CREDS") throw err;
    }
  }

  await dbSendOtp(userId, phone);
}

export async function verifyOtp(userId: number, code: string, rawPhone?: string): Promise<boolean> {
  if (useTwilioVerify() && rawPhone) {
    try {
      const phone = validatePhone(rawPhone);
      return await twilioVerifyCheck(phone, code.trim());
    } catch {
      // fall through to DB check if verify call itself fails
    }
  }

  return dbVerifyOtp(userId, code);
}

export async function cleanupExpiredOtps(): Promise<void> {
  await db.delete(otpCodesTable).where(lt(otpCodesTable.expiresAt, new Date()));
}

/* ─── Error diagnosis ─── */
function diagnoseTwilioError(code: number, message: string): string {
  const map: Record<number, string> = {
    20003: "بيانات Twilio غير صحيحة — تحقق من ACCOUNT_SID و AUTH_TOKEN",
    20404: "Verify Service SID غير صحيح",
    60200: "رقم الهاتف غير صالح، استخدم الصيغة الدولية مثل +96512345678",
    60203: "تجاوزت الحد الأقصى لطلبات OTP، انتظر قليلاً",
    60205: "لا يمكن إرسال SMS إلى هذا الرقم",
    21608: "الرقم غير موجود في قائمة أرقام Twilio التجريبية — أضفه في لوحة Twilio أو فعّل حساب مدفوع",
    21211: "رقم الهاتف غير صالح",
  };

  if (map[code]) return map[code];
  if (message.toLowerCase().includes("unverified")) {
    return "حساب Twilio تجريبي — أضف رقم الهاتف في لوحة Twilio Console أو فعّل الحساب المدفوع";
  }
  return `خطأ Twilio (${code}): ${message}`;
}
