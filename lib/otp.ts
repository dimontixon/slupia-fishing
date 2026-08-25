"use server";

import { prisma } from "@/lib/prisma";

const OTP_TTL_MINUTES = 5;

// Poland phone number, e.g. +48123456789
const PL_PHONE_REGEX = /^\+48\d{9}$/;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generates and stores a login code for the given phone number.
// TODO: replace the console.log below with a real SMS provider before going to production.
export async function requestOtp(phone: string): Promise<{ ok: boolean; error?: string }> {
  if (!PL_PHONE_REGEX.test(phone)) {
    return { ok: false, error: "Nieprawidłowy numer telefonu. Użyj formatu +48XXXXXXXXX." };
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.otpCode.create({
    data: { phone, code, expiresAt },
  });

  console.log(`[OTP] ${phone} -> ${code} (ważny ${OTP_TTL_MINUTES} min)`);

  return { ok: true };
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const otp = await prisma.otpCode.findFirst({
    where: { phone, code, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return false;

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { consumed: true },
  });

  return true;
}
