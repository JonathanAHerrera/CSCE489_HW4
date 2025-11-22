/**
 * Authentication utilities including honeyuser detection and password typo helper
 */

// Trap accounts that should trigger honeyuser detection
export const HONEYUSERS = ['admin', 'root', 'test', 'administrator'];

// Demo password for typo detection
export const DEMO_PASSWORD = 'SecurePass123!';

/**
 * Check if username is a honeyuser (trap account)
 */
export function isHoneyuser(username: string): boolean {
  return HONEYUSERS.includes(username.toLowerCase().trim());
}

/**
 * Calculate Levenshtein distance between two strings
 * Used to detect typos in passwords
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }

  return matrix[len1][len2];
}

/**
 * Check if password is correct or a typo (within 2 character difference)
 * Returns: 'correct' | 'typo' | 'wrong'
 */
export function checkPassword(inputPassword: string): 'correct' | 'typo' | 'wrong' {
  if (inputPassword === DEMO_PASSWORD) {
    return 'correct';
  }

  const distance = levenshteinDistance(inputPassword, DEMO_PASSWORD);
  
  if (distance <= 2) {
    return 'typo';
  }
  
  return 'wrong';
}

