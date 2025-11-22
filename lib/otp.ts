/**
 * OTP utility functions for generation and verification
 */

// In-memory storage for OTP codes
// In production, use Redis or a database
const otpStore = new Map<string, { code: string; generatedAt: number }>();

// OTP expiration time: 30 seconds
export const OTP_EXPIRATION_MS = 30 * 1000;

/**
 * Generate a new OTP code
 */
export function generateOTP(): { code: string; otpId: string; expiresIn: number } {
  // Generate random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const generatedAt = Date.now();
  
  // Store OTP (using a simple key, in production use session ID)
  const otpId = `otp_${generatedAt}`;
  otpStore.set(otpId, { code, generatedAt });
  
  // Clean up expired OTPs periodically
  cleanupExpiredOTPs();
  
  return {
    code,
    otpId,
    expiresIn: OTP_EXPIRATION_MS
  };
}

/**
 * Verify OTP code and check expiration
 * Returns: { valid: true } | { error: string, expired?: boolean }
 */
export function verifyOTP(code: string, otpId: string): { valid: true } | { error: string; expired?: boolean } {
  if (!code || !otpId) {
    return { error: 'Missing code or otpId' };
  }
  
  const stored = otpStore.get(otpId);
  
  if (!stored) {
    return { error: 'OTP not found or expired', expired: true };
  }
  
  const now = Date.now();
  const elapsed = now - stored.generatedAt;
  
  if (elapsed > OTP_EXPIRATION_MS) {
    otpStore.delete(otpId);
    return { error: 'OTP expired', expired: true };
  }
  
  if (stored.code !== code) {
    return { error: 'Invalid OTP code' };
  }
  
  // Valid and not expired
  otpStore.delete(otpId);
  return { valid: true };
}

/**
 * Clean up expired OTPs from memory
 */
function cleanupExpiredOTPs() {
  const now = Date.now();
  for (const [id, data] of otpStore.entries()) {
    if (now - data.generatedAt > OTP_EXPIRATION_MS) {
      otpStore.delete(id);
    }
  }
}

