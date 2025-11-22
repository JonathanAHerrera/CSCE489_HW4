/**
 * Lockout management for failed login attempts
 */

interface FailedAttempt {
  count: number;
  lockoutUntil: number | null;
}

// In-memory storage for failed attempts per username
// In production, use Redis or a database
const failedAttempts = new Map<string, FailedAttempt>();

// Lockout duration: 5 minutes
const LOCKOUT_DURATION_MS = 5 * 60 * 1000;

// Max failed attempts before lockout
const MAX_FAILED_ATTEMPTS = 3;

/**
 * Check if username is currently locked out
 */
export function isLockedOut(username: string): { locked: boolean; lockoutUntil?: number } {
  const attempts = failedAttempts.get(username);
  
  if (!attempts || !attempts.lockoutUntil) {
    return { locked: false };
  }
  
  const now = Date.now();
  if (now < attempts.lockoutUntil) {
    return { locked: true, lockoutUntil: attempts.lockoutUntil };
  }
  
  // Lockout expired, reset
  failedAttempts.delete(username);
  return { locked: false };
}

/**
 * Record a failed attempt (only for non-typo wrong passwords)
 */
export function recordFailedAttempt(username: string): void {
  const attempts = failedAttempts.get(username) || { count: 0, lockoutUntil: null };
  
  attempts.count += 1;
  
  if (attempts.count >= MAX_FAILED_ATTEMPTS) {
    attempts.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
  }
  
  failedAttempts.set(username, attempts);
}

/**
 * Clear failed attempts (on successful login)
 */
export function clearFailedAttempts(username: string): void {
  failedAttempts.delete(username);
}

/**
 * Get remaining failed attempts before lockout
 */
export function getRemainingAttempts(username: string): number {
  const attempts = failedAttempts.get(username);
  if (!attempts) {
    return MAX_FAILED_ATTEMPTS;
  }
  return Math.max(0, MAX_FAILED_ATTEMPTS - attempts.count);
}

