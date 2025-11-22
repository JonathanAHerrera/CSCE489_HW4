'use client';

import { useState, useEffect } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpId, setOtpId] = useState<string | null>(null);
  const [otpGenerated, setOtpGenerated] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [loading, setLoading] = useState(false);

  // Countdown timer for OTP expiration
  useEffect(() => {
    if (otpExpiresAt === null) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((otpExpiresAt - Date.now()) / 1000));
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        setOtpGenerated(false);
        setOtpExpiresAt(null);
        setTimeRemaining(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpExpiresAt]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const generateOTP = async () => {
    try {
      const response = await fetch('/api/otp', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate OTP');
      }

      const data = await response.json();
      setOtpId(data.otpId);
      setOtpGenerated(true);
      setOtpExpiresAt(Date.now() + data.expiresIn);
      setTimeRemaining(Math.floor(data.expiresIn / 1000));
      setOtpCode(''); // Clear previous code

      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Your OTP Code', {
          body: `Your code is: ${data.code}`,
          icon: '/favicon.ico',
        });
      } else if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification('Your OTP Code', {
              body: `Your code is: ${data.code}`,
              icon: '/favicon.ico',
            });
          }
        });
      }

      // Also show in console for testing
      console.log('OTP Code:', data.code);
      setMessage({ text: `OTP generated! Check your notifications. Code: ${data.code}`, type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to generate OTP', type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          otpCode,
          otpId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ text: data.message || 'Login successful!', type: 'success' });
        // Reset form
        setUsername('');
        setPassword('');
        setOtpCode('');
        setOtpId(null);
        setOtpGenerated(false);
        setOtpExpiresAt(null);
        setTimeRemaining(null);
      } else {
        setMessage({ 
          text: data.error || 'Login failed', 
          type: data.honeyuser ? 'error' : data.typo ? 'warning' : 'error' 
        });
      }
    } catch (error) {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Security Login Demo
        </h1>
        <p className="text-center text-gray-600 mb-8 text-sm">
          Demonstrating: Honeyuser Trap • Password Typo Helper • OTP Expiration
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              placeholder="Enter username"
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              placeholder="Enter password"
            />
            <p className="text-xs text-gray-500 mt-1">
              Demo password: SecurePass123!
            </p>
          </div>

          {/* OTP Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                OTP Code
              </label>
              {timeRemaining !== null && (
                <span className={`text-xs font-semibold ${timeRemaining < 10 ? 'text-red-600' : 'text-gray-600'}`}>
                  Expires in: {timeRemaining}s
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                id="otp"
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="000000"
                maxLength={6}
                required
              />
              <button
                type="button"
                onClick={generateOTP}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              >
                Generate OTP
              </button>
            </div>
            {!otpGenerated && (
              <p className="text-xs text-gray-500 mt-1">
                Click "Generate OTP" to receive a code via notification (optional - you can still attempt login)
              </p>
            )}
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`p-4 rounded-md ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : message.type === 'warning'
                  ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <p className="font-medium">{message.text}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Info Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Security Features:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• <strong>Honeyuser Trap:</strong> Try "admin", "root", or "test"</li>
            <li>• <strong>Typo Helper:</strong> Password close to correct? Get a warning!</li>
            <li>• <strong>OTP Expiration:</strong> Codes expire in 30 seconds</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

