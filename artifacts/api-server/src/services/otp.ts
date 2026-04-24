/**
 * Internal OTP Service — no SMS, no Twilio, no phone required.
 * OTP is generated server-side, stored as SHA-256 hash, returned to caller
 * so the frontend can display it directly to the user.
 */
import { createHash } from "crypto";
import { db } from "@workspace/db";
import { otpCodesTable } from "@workspace/db";
import { eq, and, gt, lt } from "drizzle-orm";

const OTP_EXPIRY_MINUTES = 3;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function randomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a new OTP for the given user.
 * Returns the PLAIN code (to be shown in the UI).
 * Stores only the SHA-256 hash in the database.
 */
export async function generateOtp(userId: number): Promise<string> {
  const now = new Date();

  // Enforce resend cooldown
  const [recent] = await db
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

  if (recent) {
    const ageSec = (now.getTime() - recent.createdAt.getTime()) / 1000;
    if (ageSec < RESEND_COOLDOWN_SECONDS) {
      throw new Error(`انتظر ${Math.ceil(RESEND_COOLDOWN_SECONDS - ageSec)} ثانية قبل طلب رمز جديد`);
    }
  }

  // Invalidate any existing unused OTPs for this user
  await db
    .delete(otpCodesTable)
    .where(and(eq(otpCodesTable.userId, userId), eq(otpCodesTable.used, false)));

  const plainCode = randomCode();
  const codeHash  = sha256(plainCode);
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await db.insert(otpCodesTable).values({
    userId,
    code: codeHash,       // store hash, never plain text
    expiresAt,
  });

  console.log(`[OTP] Generated for userId=${userId} | expires in ${OTP_EXPIRY_MINUTES}min`);
  return plainCode;
}

/**
 * Verify an OTP code for a user.
 * Compares SHA-256(input) against stored hash.
 * Enforces max attempts and marks used on success.
 */
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

  if (!otp) {
    console.warn(`[OTP] No valid OTP found for userId=${userId} (expired or missing)`);
    return false;
  }

  if (otp.attempts >= MAX_ATTEMPTS) {
    await db.update(otpCodesTable).set({ used: true }).where(eq(otpCodesTable.id, otp.id));
    throw new Error("تجاوزت الحد الأقصى للمحاولات، يرجى تسجيل الدخول مجدداً للحصول على رمز جديد");
  }

  const inputHash = sha256(code.trim());
  if (inputHash !== otp.code) {
    const remaining = MAX_ATTEMPTS - otp.attempts - 1;
    await db
      .update(otpCodesTable)
      .set({ attempts: otp.attempts + 1 })
      .where(eq(otpCodesTable.id, otp.id));
    console.warn(`[OTP] Wrong code for userId=${userId} | attempt=${otp.attempts + 1}/${MAX_ATTEMPTS} | remaining=${remaining}`);
    return false;
  }

  await db.update(otpCodesTable).set({ used: true }).where(eq(otpCodesTable.id, otp.id));
  console.log(`[OTP] ✓ Verified for userId=${userId}`);
  return true;
}

export async function cleanupExpiredOtps(): Promise<void> {
  await db.delete(otpCodesTable).where(lt(otpCodesTable.expiresAt, new Date()));
}
