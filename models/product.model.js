const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String },
  brand: { type: String },
  category: { type: String },
  sub_category: { type: String },
  gender: { type: String },
  size: [{ type: String }],
  price: { type: Number },
  discount: { type: Number },
  final_price: { type: Number },
  stock: { type: Number },
  rating: { type: Number },
  description: { type: String },
  color: { type: String },
  tags: [{ type: String }],
  images: [{ type: String }],
  release_date: { type: Date },
  is_active: { type: Boolean }
}, { timestamps: true });

module.exports = mongoose.model("products", productSchema);
