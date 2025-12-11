const User = require('../../models/userModel');
const bcrypt = require('bcryptjs');
const { paginateAndSearch } = require('../../utils/pagination');
const csv = require("csvtojson");
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
    const search = req.query.search || "";
    const role = req.query.role || null;
    const status = req.query.status || null;

    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.status = status;
    }

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}${req.path}`;

    const data = await paginateAndSearch(User, {
      page,
      pageSize,
      search,
      searchFields: ["name", "phoneNumber", "email", "company"],
      filter,
      sort: { createdAt: -1 },
      baseUrl,
      originalQuery: req.query,
    });

    res.status(200).json({
      count: data.total,
      next: data.next,
      previous: data.previous,
      results: data.results,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
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
    const { name, email, password, role, status, company, description,phoneNumber } = req.body;
    const profilePicture = req.file ? req.file.path : null;

    const updatedFields = { name, email, role, status, company, description,phoneNumber };

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
const bulkUploadUsers = async (req, res) => {
  try {
    let users = [];
    if (req.file) users = await csv().fromFile(req.file.path);
    else if (req.body.users) users = req.body.users;
    else return res.status(400).json({ message: "No data provided" });

    const phones = users.map(u => u.phoneNumber).filter(Boolean);
    const emails = users.map(u => u.email).filter(Boolean);

    const existing = await User.find({
      $or: [
        { phoneNumber: { $in: phones } },
        { email: { $in: emails } }
      ]
    }).select("phoneNumber email");

    const existingPhones = new Set(existing.map(u => u.phoneNumber));
    const existingEmails = new Set(existing.map(u => u.email));

    const invalidRows = [];
    const validUsers = [];

    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      const rowNum = i + 1;

      if (!u.phoneNumber) { invalidRows.push({ row: rowNum, reason: "Phone missing", data: u }); continue; }
      if (existingPhones.has(u.phoneNumber)) { invalidRows.push({ row: rowNum, reason: "Phone exists", data: u }); continue; }
      if (u.email && existingEmails.has(u.email)) { invalidRows.push({ row: rowNum, reason: "Email exists", data: u }); continue; }

      validUsers.push(u);
    }

    if (invalidRows.length > 0) {
      return res.status(400).json({ message: "Validation failed", invalidRows });
    }

    const formattedUsers = validUsers.map(u => ({
      phoneNumber: u.phoneNumber,
      name: u.name || null,
      email: u.email || null,
      role: u.role || "customer",
      status: u.status || "active",
      company: u.company || null,
      description: u.description || null
    }));

    await User.insertMany(formattedUsers);

    res.status(201).json({ message: "Bulk upload successful", uploaded: formattedUsers.length });
  } catch (err) {
    res.status(500).json({ message: "Bulk upload failed", error: err.message });
  }
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser,bulkUploadUsers };
