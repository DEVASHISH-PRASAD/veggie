import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountPercentage: { type: Number, required: true, min: 1, max: 100 },
    maxDiscountLimit: { type: Number, required: true },
    minOrderValue: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Coupon = mongoose.model("Coupon", CouponSchema);
export default Coupon;
