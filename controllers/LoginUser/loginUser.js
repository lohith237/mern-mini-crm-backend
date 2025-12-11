const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/userModel');

const loginUser = async (req, res) => {
  try {
    const { phoneNumber, email, password } = req.body;

    const user = await User.findOne({ $or: [{ phoneNumber }, { email }] });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '90d' });

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json({ message: 'Login successful', token, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
};

module.exports = loginUser;
