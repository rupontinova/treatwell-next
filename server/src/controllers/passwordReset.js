const Patient = require('../models/Patient');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    const patient = await Patient.findOne({ email: email.toLowerCase() });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'No account found with that email address'
      });
    }

    // Get reset token
    const resetToken = patient.getResetPasswordToken();

    await patient.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3001'}/reset-password/${resetToken}`;

    const transporter = createTransporter();

    const mailOptions = {
      from: `"TreatWell Support" <${process.env.EMAIL_USER || 'noreply@treatwell.com'}>`,
      to: patient.email,
      subject: 'Password Reset Request - TreatWell',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">TreatWell</h1>
              <p style="color: #6b7280; margin: 5px 0 0 0;">Healthcare Platform</p>
            </div>
            
            <h2 style="color: #374151; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Hello <strong>${patient.fullName}</strong>,
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset your password for your TreatWell account. If you made this request, please click the button below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 10px;">
              <strong>Important:</strong> This link will expire in 15 minutes for security reasons.
            </p>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
              If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                This is an automated message from TreatWell. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      
      res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } catch (error) {
      console.error('Email sending error:', error);
      
      // For testing: Don't reset token, just inform user
      // In production, you'd want to reset the token on email failure
      
      return res.status(200).json({
        success: true,
        message: `Email could not be sent to Gmail. Reset token: ${resetToken} (For testing only - check server console)`
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { resettoken } = req.params;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resettoken)
      .digest('hex');

    const patient = await Patient.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!patient) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    // Set new password
    patient.password = newPassword;
    patient.resetPasswordToken = undefined;
    patient.resetPasswordExpire = undefined;
    await patient.save();

    // Send confirmation email
    const transporter = createTransporter();
    
    const confirmationMailOptions = {
      from: `"TreatWell Support" <${process.env.EMAIL_USER || 'noreply@treatwell.com'}>`,
      to: patient.email,
      subject: 'Password Reset Successful - TreatWell',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">TreatWell</h1>
              <p style="color: #6b7280; margin: 5px 0 0 0;">Healthcare Platform</p>
            </div>
            
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="background-color: #10b981; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px;">
                ✓
              </div>
            </div>
            
            <h2 style="color: #374151; margin-bottom: 20px; text-align: center;">Password Reset Successful</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Hello <strong>${patient.fullName}</strong>,
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Your password has been successfully reset. You can now log in to your TreatWell account using your new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:3001'}/login" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Login to TreatWell
              </a>
            </div>
            
            <p style="color: #dc2626; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
              <strong>Security Notice:</strong> If you didn't reset your password, please contact our support team immediately.
            </p>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                This is an automated message from TreatWell. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(confirmationMailOptions);
    } catch (emailError) {
      console.error('Confirmation email error:', emailError);
      // Don't fail the request if confirmation email fails
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 