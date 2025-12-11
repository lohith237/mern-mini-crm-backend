const User = require('../../models/userModel');
const bcrypt = require('bcryptjs');
const { paginateAndSearch } = require('../../utils/pagination');

const createUser = async (req, res) => {
  try {
    const { phoneNumber, name, email, password, role = 'customer', status = 'active', company, description } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
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

    const newUser = new User({
      phoneNumber,
      name,
      email,
      password:hashedPassword,
      role,
      status,
      profilePicture,
      company,
      description
    });

    await newUser.save();

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.page_size) || 10;
    const search = req.query.search || '';
    const role = req.query.role || null;

    const filter = {};

    if (role) {
      filter.role = role;
    }

    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;

    const data = await paginateAndSearch(User, {
      page,
      pageSize,
      search,
      searchFields: ['name', 'phoneNumber', 'email', 'company'],
      filter,
      sort: { createdAt: -1 },
      baseUrl,
      originalQuery: req.query
    });

    res.status(200).json({
      count: data.total,
      next: data.next,
      previous: data.previous,
      results: data.results
    });
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
    const { name, email, password, role, status, company, description } = req.body;
    const profilePicture = req.file ? req.file.path : null;

    const updatedFields = { name, email, role, status, company, description };

    if (password) {
      updatedFields.password = await bcrypt.hash(password, 10);
    }

    if (profilePicture) {
      updatedFields.profilePicture = profilePicture;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).select('-password');

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
