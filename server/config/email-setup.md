# Email Setup Guide for Password Reset

## Gmail SMTP Configuration

### Step 1: Enable 2-Factor Authentication
1. Go to your [Google Account settings](https://myaccount.google.com/)
2. Navigate to "Security"
3. Enable "2-Step Verification"

### Step 2: Generate App Password
1. In Google Account Security settings
2. Click "App passwords"
3. Select "Mail" and your device
4. Copy the generated 16-character password

### Step 3: Environment Variables

Add these to your `server/.env` file:

```bash
# Email Configuration
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-16-character-app-password

# Frontend URL (for reset links)
CLIENT_URL=http://localhost:3001
```

### Step 4: Production Setup

For production, update the environment variables:

```bash
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your-production-email-password
CLIENT_URL=https://yourdomain.com
```

## Alternative Email Services

### SendGrid
```bash
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
```

### Mailgun
```bash
EMAIL_SERVICE=mailgun
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain
```

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use app passwords** instead of your main Gmail password
3. **Rotate passwords** regularly
4. **Use dedicated email** for production (noreply@yourdomain.com)
5. **Enable HTTPS** in production for secure reset links

## Testing

Test the email functionality:

```bash
# Start the server
npm start

# Send a test request
curl -X POST http://localhost:5001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Troubleshooting

### Common Issues:

1. **"Invalid login"**: Check app password and 2FA
2. **"Connection refused"**: Verify Gmail SMTP settings
3. **"Email not sent"**: Check firewall/antivirus blocking
4. **"Rate limited"**: Gmail has sending limits (100 emails/day for free accounts) 