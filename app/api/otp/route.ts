/**
 * OTP Generation API Route
 * Generates a 6-digit OTP code with expiration timestamp
 */
import { NextResponse } from 'next/server';
import { generateOTP, verifyOTP } from '@/lib/otp';

export async function POST() {
  const result = generateOTP();
  return NextResponse.json(result);
}

/**
 * Verify OTP code and check expiration
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const otpId = searchParams.get('otpId');
  
  if (!code || !otpId) {
    return NextResponse.json({ error: 'Missing code or otpId' }, { status: 400 });
  }
  
  const result = verifyOTP(code, otpId);
  
  if ('valid' in result) {
    return NextResponse.json({ valid: true });
  }
  
  const status = result.expired ? 400 : 400;
  return NextResponse.json(result, { status });
}

