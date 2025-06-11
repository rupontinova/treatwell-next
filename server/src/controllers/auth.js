const Patient = require('../models/Patient');

// @desc    Register patient
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const {
      username,
      fullName,
      email,
      password,
      gender,
      dob,
      nationalId,
      phone,
      address
    } = req.body;

    // Check if patient already exists
    const existingPatient = await Patient.findOne({
      $or: [{ email }, { username }, { nationalId }]
    });

    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: 'Patient already exists with this email, username, or national ID'
      });
    }

    // Create patient
    const patient = await Patient.create({
      username,
      fullName,
      email,
      password,
      gender,
      dob,
      nationalId,
      phone,
      address
    });

    sendTokenResponse(patient, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login patient
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate username & password
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // Check for patient
    const patient = await Patient.findOne({ username }).select('+password');

    if (!patient) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await patient.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    sendTokenResponse(patient, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  const patient = await Patient.findById(req.patient.id);
  res.status(200).json({
    success: true,
    data: patient
  });
};

// Get token from model, create cookie and send response
const sendTokenResponse = (patient, statusCode, res) => {
  // Create token
  const token = patient.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
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
        email: patient.email
      }
    });
}; 