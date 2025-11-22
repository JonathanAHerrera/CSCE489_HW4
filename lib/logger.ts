/**
 * Simple file-based logging for honeyuser attempts
 */
import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'honeyuser-attempts.log');

/**
 * Ensure logs directory exists
 */
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

/**
 * Log a honeyuser attempt
 */
export function logHoneyuserAttempt(username: string, ip?: string, userAgent?: string) {
  ensureLogDir();
  
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] Honeyuser attempt: ${username}${ip ? ` from ${ip}` : ''}${userAgent ? ` (${userAgent})` : ''}\n`;
  
  fs.appendFileSync(LOG_FILE, logEntry, 'utf8');
}

