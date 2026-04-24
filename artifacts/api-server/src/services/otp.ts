import { db } from "@workspace/db";
import { otpCodesTable, usersTable } from "@workspace/db";
import { eq, and, gt, lt } from "drizzle-orm";

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const IS_DEV = process.env.NODE_ENV !== "production";

/* ─── Phone validation ─── */
export function validatePhone(phone: string): string {
  const cleaned = phone.trim().replace(/\s+/g, "");
  if (/^\+[1-9]\d{6,14}$/.test(cleaned)) return cleaned;
  if (/^[569]\d{7}$/.test(cleaned)) return `+965${cleaned}`;
  throw new Error("رقم الهاتف غير صالح. استخدم الصيغة الدولية مثل: +96512345678");
}

/* ─── DB helpers ─── */
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function checkResendCooldown(userId: number): Promise<void> {
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
}

async function saveCodeToDB(userId: number): Promise<string> {
  await db.delete(otpCodesTable).where(and(eq(otpCodesTable.userId, userId), eq(otpCodesTable.used, false)));
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  await db.insert(otpCodesTable).values({ userId, code, expiresAt });
  return code;
}

async function dbVerifyOtp(userId: number, code: string): Promise<boolean> {
  const now = new Date();
  const [otp] = await db
    .select()
    .from(otpCodesTable)
    .where(and(eq(otpCodesTable.userId, userId), eq(otpCodesTable.used, false), gt(otpCodesTable.expiresAt, now)))
    .limit(1);

  if (!otp) return false;

  if (otp.attempts >= MAX_ATTEMPTS) {
    await db.update(otpCodesTable).set({ used: true }).where(eq(otpCodesTable.id, otp.id));
    throw new Error("تجاوزت الحد الأقصى للمحاولات، اطلب رمزاً جديداً");
  }

  if (otp.code !== code.trim()) {
    await db.update(otpCodesTable).set({ attempts: otp.attempts + 1 }).where(eq(otpCodesTable.id, otp.id));
    return false;
  }

  await db.update(otpCodesTable).set({ used: true }).where(eq(otpCodesTable.id, otp.id));
  return true;
}

/* ─── Twilio Verify ─── */
const VERIFY_SID = process.env.TWILIO_VERIFY_SERVICE_SID || "VAd135cffdf1dd94ecf0f1badd29fdaecf";

function hasTwilioCreds(): boolean {
  return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
}

function twilioAuth(): string {
  const sid   = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  return `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`;
}

async function twilioVerifySend(phone: string): Promise<"ok" | "trial_limit"> {
  const url = `https://verify.twilio.com/v2/Services/${VERIFY_SID}/Verifications`;

  console.log(`[OTP] → Twilio Verify send | phone=${phone} | service=${VERIFY_SID}`);

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: twilioAuth(), "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: phone, Channel: "sms" }),
  });

  const body = await res.json() as Record<string, unknown>;
  console.log(`[OTP] ← Twilio response | http=${res.status} | status=${body.status} | code=${body.code ?? "—"}`);

  if (!res.ok) {
    const errCode = Number(body.code ?? 0);
    const errMsg  = String(body.message ?? body.error_message ?? "");
    console.error(`[OTP] ✗ Twilio error | code=${errCode} | message=${errMsg}`);

    // 21608 = unverified number (trial account limitation)
    if (errCode === 21608 || errMsg.toLowerCase().includes("unverified") || errMsg.toLowerCase().includes("trial")) {
      return "trial_limit";
    }
    throw new Error(diagnoseTwilioError(errCode, errMsg));
  }

  console.log(`[OTP] ✓ SMS dispatched via Twilio Verify`);
  return "ok";
}

async function twilioVerifyCheck(phone: string, code: string): Promise<boolean> {
  const url = `https://verify.twilio.com/v2/Services/${VERIFY_SID}/VerificationChecks`;

  console.log(`[OTP] → Twilio Verify check | phone=${phone}`);

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: twilioAuth(), "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: phone, Code: code }),
  });

  const body = await res.json() as Record<string, unknown>;
  console.log(`[OTP] ← Twilio check | http=${res.status} | verification_status=${body.status}`);

  if (res.status === 404) { console.error("[OTP] ✗ Verification not found (expired or already used)"); return false; }
  if (!res.ok) { console.error(`[OTP] ✗ Check failed | ${JSON.stringify(body)}`); return false; }

  return body.status === "approved";
}

/* ─── Public API ─── */

export async function sendOtp(userId: number, rawPhone: string): Promise<void> {
  const phone = validatePhone(rawPhone);
  await checkResendCooldown(userId);

  if (hasTwilioCreds()) {
    const result = await twilioVerifySend(phone);

    if (result === "trial_limit") {
      // Trial account — Twilio can't deliver. Fall back to local code so dev can proceed.
      const code = await saveCodeToDB(userId);
      console.log("╔══════════════════════════════════════════════════════╗");
      console.log("║  ⚠  TWILIO TRIAL MODE — SMS لم يُرسَل                ║");
      console.log("║                                                      ║");
      console.log(`║  رمز التحقق: ${code}                               ║`);
      console.log("║                                                      ║");
      console.log("║  لتفعيل الإرسال الحقيقي:                            ║");
      console.log("║  twilio.com/console → Verified Caller IDs            ║");
      console.log("║  أضف رقم الهاتف وتحقق منه، ثم جرب مجدداً            ║");
      console.log("╚══════════════════════════════════════════════════════╝");
      return;
    }

    // Twilio Verify sent successfully.
    // In dev mode, ALSO store a local fallback code visible in logs.
    if (IS_DEV) {
      const devCode = await saveCodeToDB(userId);
      console.log(`[OTP DEV] Fallback code (if SMS delayed): ${devCode}`);
    }

    return;
  }

  // No Twilio creds at all — pure dev mode
  const code = await saveCodeToDB(userId);
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  DEV MODE — رمز التحقق (لا يُرسَل SMS)          ║");
  console.log(`║  الرمز: ${code}                                  ║`);
  console.log("╚══════════════════════════════════════════════════╝");
}

export async function verifyOtp(userId: number, code: string, rawPhone?: string): Promise<boolean> {
  const trimmedCode = code.trim();

  // Try Twilio Verify first (if creds present and phone known)
  if (hasTwilioCreds() && rawPhone) {
    try {
      const phone = validatePhone(rawPhone);
      const ok = await twilioVerifyCheck(phone, trimmedCode);
      if (ok) return true;
      // Twilio said wrong — but in dev mode, also try local DB code as fallback
      if (IS_DEV) {
        console.log("[OTP] Twilio check failed — trying local dev fallback code...");
        return dbVerifyOtp(userId, trimmedCode);
      }
      return false;
    } catch {
      // If Twilio check itself throws, fall through to DB
      console.warn("[OTP] Twilio check threw — falling back to local DB");
    }
  }

  return dbVerifyOtp(userId, trimmedCode);
}

export async function cleanupExpiredOtps(): Promise<void> {
  await db.delete(otpCodesTable).where(lt(otpCodesTable.expiresAt, new Date()));
}

/* ─── Error messages ─── */
function diagnoseTwilioError(code: number, message: string): string {
  const map: Record<number, string> = {
    20003: "بيانات Twilio غير صحيحة — تحقق من ACCOUNT_SID و AUTH_TOKEN",
    20404: "Verify Service SID غير صحيح",
    60200: "رقم الهاتف غير صالح، استخدم الصيغة الدولية مثل +96512345678",
    60203: "تجاوزت الحد الأقصى لطلبات OTP، انتظر قليلاً",
    60205: "لا يمكن إرسال SMS إلى هذا الرقم",
    21608: "حساب Twilio تجريبي — أضف الرقم في Verified Caller IDs أو فعّل الحساب المدفوع",
    21211: "رقم الهاتف غير صالح",
  };
  if (map[code]) return map[code];
  if (message.toLowerCase().includes("unverified") || message.toLowerCase().includes("trial")) {
    return "حساب Twilio تجريبي — أضف رقم الهاتف في لوحة Twilio Console أو فعّل الحساب المدفوع";
  }
  return `خطأ Twilio (${code}): ${message}`;
}
