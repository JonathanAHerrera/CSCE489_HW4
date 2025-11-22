/**
 * Login API Route
 * Handles login logic: honeyuser detection, password validation, OTP verification
 */
import { NextRequest, NextResponse } from 'next/server';
import { isHoneyuser, checkPassword } from '@/lib/auth';
import { logHoneyuserAttempt } from '@/lib/logger';
import { isLockedOut, recordFailedAttempt, clearFailedAttempts, getRemainingAttempts } from '@/lib/lockout';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, otpCode, otpId } = body;
    
    // Get client IP and user agent for logging
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // 1. Check for honeyuser (trap account)
    if (isHoneyuser(username)) {
      logHoneyuserAttempt(username, ip, userAgent);
      return NextResponse.json({ 
        error: `WE CAUGHT YOU HACKER MUAHAHAHAHA - We blocked your IP: ${ip}`,
        honeyuser: true 
      }, { status: 403 });
    }
    
    // 2. Check if account is locked out
    const lockoutStatus = isLockedOut(username);
    if (lockoutStatus.locked) {
      const lockoutMinutes = Math.ceil((lockoutStatus.lockoutUntil! - Date.now()) / 60000);
      return NextResponse.json({ 
        error: `Account locked. Please try again in ${lockoutMinutes} minute(s).`,
        locked: true
      }, { status: 423 });
    }
    
    // 3. Check password (only if not honeyuser and not locked)
    const passwordResult = checkPassword(password);
    
    if (passwordResult === 'correct') {
      // Password is correct, now check OTP
      if (!otpCode || !otpId) {
        return NextResponse.json({ 
          error: 'OTP code is required' 
        }, { status: 400 });
      }
      
      // Verify OTP
      const { verifyOTP } = await import('@/lib/otp');
      const otpResult = verifyOTP(otpCode, otpId);
      
      if ('error' in otpResult) {
        // OTP is expired or wrong
        return NextResponse.json({ 
          error: 'Code is expired / wrong',
          otpError: true
        }, { status: 400 });
      }
      
      // All checks passed! Clear any failed attempts
      clearFailedAttempts(username);
      return NextResponse.json({ 
        success: true,
        message: 'Login successful!' 
      });
      
    } else if (passwordResult === 'typo') {
      // Password is close but not quite right - don't count as failed attempt
      return NextResponse.json({ 
        error: 'Wrong password',
        typo: true 
      }, { status: 400 });
      
    } else {
      // Password is wrong - record failed attempt
      recordFailedAttempt(username);
      const remaining = getRemainingAttempts(username);
      
      if (remaining === 0) {
        // Just got locked out
        const lockoutStatus = isLockedOut(username);
        const lockoutMinutes = Math.ceil((lockoutStatus.lockoutUntil! - Date.now()) / 60000);
        return NextResponse.json({ 
          error: `Account locked after 3 failed attempts. Please try again in ${lockoutMinutes} minute(s).`,
          locked: true
        }, { status: 423 });
      }
      
      return NextResponse.json({ 
        error: `Wrong password. ${remaining} attempt(s) remaining before lockout.`,
        remainingAttempts: remaining
      }, { status: 401 });
    }
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

