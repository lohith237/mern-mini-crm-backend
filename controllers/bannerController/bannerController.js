const Banner = require('../../models/Banner');
const SubCategory = require('../../models/SubCategory');
const { paginateAndSearch } = require('../../utils/pagination');

const createBanner = async (req, res) => {
  try {
    const { name, banner_type, Subcategory } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !Subcategory) {
      return res.status(400).json({ message: 'Name and Subcategory are required' });
    }

    const existingBanner = await Banner.findOne({ name });
    if (existingBanner) {
      return res.status(400).json({ message: 'Banner name already exists' });
    }

    const newBanner = await Banner.create({
      name,
      banner_type,
      Subcategory,
      image
    });

    const result = await Banner.findById(newBanner._id).populate('Subcategory');

    res.status(201).json({ message: 'Banner created successfully', banner: result });
  } catch (err) {
    res.status(500).json({ message: 'Error creating banner', error: err.message });
  }
};

const getAllBanners = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.page_size) || 10;
    const search = req.query.search || '';

    const filter = {};

    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;

    const data = await paginateAndSearch(Banner, {
      page,
      pageSize,
      search,
      searchFields: ['name', 'banner_type'],
      filter,
      sort: { createdAt: -1 },
      baseUrl,
      originalQuery: req.query,
      populate: ['Subcategory']
    });

    res.status(200).json({
      count: data.total,
      next: data.next,
      previous: data.previous,
      results: data.results
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching banners', error: err.message });
  }
};

const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id).populate('Subcategory');
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.status(200).json({ banner });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching banner', error: err.message });
  }
};

const updateBanner = async (req, res) => {
  try {
    const { name, banner_type, Subcategory } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const updatedFields = {
      name,
      banner_type,
      Subcategory
    };
     if (!name || !Subcategory) {
      return res.status(400).json({ message: 'Name and Subcategory are required' });
    }
    if (image) {
      updatedFields.image = image;
    }

    const updatedBanner = await Banner.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    ).populate('Subcategory');

    if (!updatedBanner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.status(200).json({ message: 'Banner updated successfully', banner: updatedBanner });
  } catch (err) {
    res.status(500).json({ message: 'Error updating banner', error: err.message });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const deletedBanner = await Banner.findByIdAndDelete(req.params.id);
    if (!deletedBanner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.status(200).json({ message: 'Banner deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting banner', error: err.message });
  }
};

module.exports = {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner
};
