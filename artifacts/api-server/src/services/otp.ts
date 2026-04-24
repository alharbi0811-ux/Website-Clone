import { db } from "@workspace/db";
import { otpCodesTable, usersTable } from "@workspace/db";
import { eq, and, gt, lt } from "drizzle-orm";

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendViaTwilio(phone: string, code: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_FROM;

  if (!sid || !token || !from) {
    console.log(`[OTP DEV] Phone: ${phone} → Code: ${code}`);
    return;
  }

  const body = `رمز التحقق في تطبيق ركز: ${code}\nصالح لمدة ${OTP_EXPIRY_MINUTES} دقائق.`;
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: phone, From: from, Body: body }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[OTP] Twilio error:", err);
    throw new Error("فشل إرسال رمز OTP، تحقق من رقم الهاتف");
  }
}

export async function sendOtp(userId: number, phone: string): Promise<void> {
  const now = new Date();

  const recentOtp = await db
    .select()
    .from(otpCodesTable)
    .where(
      and(
        eq(otpCodesTable.userId, userId),
        eq(otpCodesTable.used, false),
        gt(otpCodesTable.expiresAt, now)
      )
    )
    .limit(1);

  if (recentOtp.length > 0) {
    const age = (now.getTime() - recentOtp[0].createdAt.getTime()) / 1000;
    if (age < 60) {
      throw new Error("انتظر دقيقة قبل طلب رمز جديد");
    }
  }

  await db
    .delete(otpCodesTable)
    .where(and(eq(otpCodesTable.userId, userId), eq(otpCodesTable.used, false)));

  const code = generateCode();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await db.insert(otpCodesTable).values({ userId, code, expiresAt });

  await sendViaTwilio(phone, code);
}

export async function verifyOtp(userId: number, code: string): Promise<boolean> {
  const now = new Date();

  const [otp] = await db
    .select()
    .from(otpCodesTable)
    .where(
      and(
        eq(otpCodesTable.userId, userId),
        eq(otpCodesTable.used, false),
        gt(otpCodesTable.expiresAt, now)
      )
    )
    .limit(1);

  if (!otp) return false;

  if (otp.attempts >= MAX_ATTEMPTS) {
    await db.update(otpCodesTable).set({ used: true }).where(eq(otpCodesTable.id, otp.id));
    throw new Error("تجاوزت الحد الأقصى للمحاولات، اطلب رمزاً جديداً");
  }

  if (otp.code !== code) {
    await db
      .update(otpCodesTable)
      .set({ attempts: otp.attempts + 1 })
      .where(eq(otpCodesTable.id, otp.id));
    return false;
  }

  await db.update(otpCodesTable).set({ used: true }).where(eq(otpCodesTable.id, otp.id));
  return true;
}

export async function cleanupExpiredOtps(): Promise<void> {
  await db.delete(otpCodesTable).where(lt(otpCodesTable.expiresAt, new Date()));
}
