const { OAuth2Client } = require('google-auth-library');
const Patient = require('../models/Patient');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Google Login/Register
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload['sub'];
    const email = payload['email'];
    const fullName = payload['name'];
    const profilePicture = payload['picture'];

    // Check if user already exists with this Google ID
    let patient = await Patient.findOne({ googleId });

    if (patient) {
      // User exists, log them in
      sendTokenResponse(patient, 200, res);
    } else {
      // Check if user exists with this email (regular registration)
      const existingPatient = await Patient.findOne({ email });
      
      if (existingPatient) {
        // Link Google account to existing account
        existingPatient.googleId = googleId;
        existingPatient.profilePicture = profilePicture;
        await existingPatient.save();
        sendTokenResponse(existingPatient, 200, res);
      } else {
        // Create new user with Google data
        // Generate username from email
        const username = email.split('@')[0] + '_' + Date.now().toString().slice(-4);
        
        const newPatient = await Patient.create({
          googleId,
          username,
          fullName,
          email,
          profilePicture,
          // Required fields with default values for Google users
          gender: 'Not specified',
          dob: new Date('1990-01-01'), // Default DOB, user can update later
          nationalId: 'GOOGLE_' + googleId.slice(-8), // Temporary ID
          phone: 'Not provided',
          address: 'Not provided'
        });

        sendTokenResponse(newPatient, 201, res);
      }
    }
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message
    });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (patient, statusCode, res) => {
  // Create token
  const token = patient.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  res
    .status(statusCode)
    .json({
      success: true,
      token,
      patient: {
        id: patient._id,
        username: patient.username,
        fullName: patient.fullName,
        email: patient.email,
        profilePicture: patient.profilePicture
      }
    });
}; 