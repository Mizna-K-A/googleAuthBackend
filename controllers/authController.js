const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Import bcrypt
const User = require('../models/Users');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID; // Add your Google client ID here
const client = new OAuth2Client(CLIENT_ID);

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};
// Register a new user
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.status(200).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Google authentication
exports.googleAuth = async (req, res) => {
  const { token } = req.body; // The token from the frontend
  console.log(token);
  
  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID, // Ensure the token is for your app
    });
    const payload = ticket.getPayload(); // Get user details from Google
    // Check if the user already exists in your database
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      // If the user does not exist, create a new user
      user = new User({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub, // Store Google ID for future reference
      });
      await user.save();
    }

    // Generate a JWT token for your app after successful authentication
    const authToken = generateToken(user.id);
    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: authToken, // Send the generated token
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Google authentication failed', error: error.message});
 }
};
