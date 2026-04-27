import { SignJWT } from "jose";

export async function makeToken(payload: { user: string }) {
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "fallback-secret-for-dev-only",
  );

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("1h") // Set your preferred expiration
    .sign(secret);
}
