const User = require('../../models/userModel');
const bcrypt = require('bcryptjs');


const createUser = async (req, res) => {
  try {
    const { phoneNumber, name, email, password, role = 'customer', status = 'active' } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    let hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const profilePicture = req.file ? req.file.path : null;

    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }

    const newUser = new User({ phoneNumber, name, email, password: hashedPassword, role, status, profilePicture });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
};




const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;
    const profilePicture = req.file ? req.file.path : null;
    
    let updatedFields = { name, email, role, status };

    if (password) {
      updatedFields.password = await bcrypt.hash(password, 10);
    }

    if (profilePicture) {
      updatedFields.profilePicture = profilePicture;
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: updatedFields }, { new: true, runValidators: true }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser };
