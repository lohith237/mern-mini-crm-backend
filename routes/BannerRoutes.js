const express = require('express');
const upload = require('../middleware/multer');
const {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner
} = require('../controllers/bannerController/bannerController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', upload.single('image'), authMiddleware, adminMiddleware, createBanner);
router.patch('/:id', upload.single('image'), authMiddleware, adminMiddleware, updateBanner);
router.get('/', getAllBanners);
router.get('/:id', authMiddleware, getBannerById);
router.delete('/:id', authMiddleware, adminMiddleware, deleteBanner);

module.exports = router;
