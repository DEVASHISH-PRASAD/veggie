import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    nameEN: { type: String, required: true, unique: true, trim: true },
    nameHI: { type: String, required: true, unique: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Root Vegetables",
        "Leafy Greens",
        "Vine Vegetables",
        "Bulbs & Stems",
        "Spices & Herbs",
      ],
    },
    pricePerKg: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "kg" },
    imageSecureUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", ProductSchema);
export default Product;
