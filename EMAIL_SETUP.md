# Email Setup for Meeting Links

This document explains how to set up email functionality for sending meeting links to patients.

## Environment Variables Required

Add these variables to your `.env.local` file:

```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

## Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to your Google Account settings
   - Navigate to Security → 2-Step Verification → App passwords
   - Select "Mail" and generate a new app password
   - Use this app password (not your regular password) in `EMAIL_PASS`

## Alternative Email Providers

You can also use other email providers by modifying the transporter configuration in `/src/app/api/appointments/meeting-link/route.ts`:

### Outlook/Hotmail
```javascript
const transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

### Custom SMTP
```javascript
const transporter = nodemailer.createTransport({
  host: 'your-smtp-server.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

## Testing the Feature

1. Set up the environment variables
2. Book an appointment as a patient
3. Confirm the appointment as a doctor
4. Use the "Send Meeting Link" button
5. Check the patient's email for the meeting invitation

## Troubleshooting

- **"Invalid login"**: Make sure you're using an app password, not your regular Gmail password
- **"Connection refused"**: Check if 2-factor authentication is enabled
- **Email not received**: Check spam folder and verify the patient's email address 