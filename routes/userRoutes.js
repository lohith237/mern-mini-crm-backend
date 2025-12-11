const express = require('express');
const upload = require('../middleware/multer');
const { createUser, getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', upload.single('profilePicture'), createUser);
router.patch('/:id', upload.single('profilePicture'), authMiddleware, updateUser);
router.get('/', authMiddleware, adminMiddleware, getAllUsers);
router.get('/:id', authMiddleware, getUserById);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);

module.exports = router;
