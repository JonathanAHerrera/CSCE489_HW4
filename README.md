# CSCE489_HW4 - Security Login Demo

A Next.js web application demonstrating three security features:
1. **Honeyuser Login Trap** - Detects attempts on trap accounts
2. **Password Typo Helper** - Detects near-miss passwords and warns without counting as failed attempts
3. **OTP Expiration Demo** - Generates time-limited OTP codes with browser notifications


## Features

### 1. Honeyuser Login Trap
- Detects attempts on trap accounts: `admin`, `root`, `test`, `administrator`
- Logs suspicious attempts to `logs/honeyuser-attempts.log`
- Displays warning message: "WE CAUGHT YOU HACKER MUAHAHAHAHA"

### 2. Password Typo Helper
- Uses Levenshtein distance algorithm to detect typos
- If password is within 2 characters of correct password, shows warning without counting as failed attempt
- Demo password: `SecurePass123!`

### 3. OTP Expiration Demo
- Generates 6-digit OTP codes
- Codes expire after 30 seconds
- Sends browser notification with the code
- Validates code correctness and expiration on login

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

4. **Important**: Allow browser notifications when prompted (for OTP delivery)

## Usage

1. **Generate OTP**: Click "Generate OTP" button to receive a code via browser notification
2. **Enter credentials**:
   - Username: Any username (except trap accounts)
   - Password: `SecurePass123!` (or try a typo like `SecurePass123` to see typo detection)
   - OTP: Enter the 6-digit code from the notification
3. **Test honeyuser trap**: Try username `admin`, `root`, or `test` to see the trap in action
4. **Test typo detection**: Enter a password close to `SecurePass123!` (e.g., `SecurePass123` or `SecurePass12!`)

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── login/route.ts    # Login API endpoint
│   │   └── otp/route.ts      # OTP generation/verification API
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Main login page
│   └── globals.css           # Global styles
├── lib/
│   ├── auth.ts               # Authentication utilities (honeyuser, typo detection)
│   ├── logger.ts             # Honeyuser attempt logging
│   └── otp.ts                # OTP generation and verification
└── logs/
    └── honeyuser-attempts.log # Log file for honeyuser attempts
```

## Security Notes

- This is a demonstration project for educational purposes
- OTP codes are stored in-memory (not suitable for production)
- Use proper session management and secure storage in production
- Honeyuser logging helps detect brute-force and credential stuffing attacks
- Typo detection balances security with usability
