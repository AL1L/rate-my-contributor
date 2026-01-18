import { headers } from "next/headers";
import crypto from "crypto";

const CSRF_SECRET = process.env.NEXTAUTH_SECRET || "default-secret";

export function generateCsrfToken(sessionId: string): string {
  const token = crypto
    .createHmac("sha256", CSRF_SECRET)
    .update(sessionId)
    .digest("hex");
  return token;
}

export async function validateCsrfToken(token: string, sessionId: string): Promise<boolean> {
  const expectedToken = generateCsrfToken(sessionId);
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(expectedToken)
  );
}

export async function verifyCsrfToken(sessionId: string): Promise<boolean> {
  const headersList = await headers();
  const token = headersList.get("x-csrf-token");
  
  if (!token || !sessionId) {
    return false;
  }
  
  try {
    return await validateCsrfToken(token, sessionId);
  } catch {
    return false;
  }
}
