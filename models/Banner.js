const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema(
  {
    Subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      required: true,
      unique: true
    },
    banner_type: {
      type: String,
      enum: ['FullWidth', 'Sliders']
    },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Banner', BannerSchema);
