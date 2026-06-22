import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        nameEN: String,
        nameHI: String,
        quantity: { type: Number, required: true },
        priceAtPurchase: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    discountApplied: { type: Number, default: 0 },
    payableAmount: { type: Number, required: true },
    deliveryAddress: {
      flatAndBuilding: String,
      areaLandmark: String,
      pincode: String,
      zone: String,
    },
    status: {
      type: String,
      enum: [
        "PLACED",
        "PROCURING",
        "PROCESSING_PACKING",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PLACED",
    },
    paymentMethod: { type: String, enum: ["UPI", "COD"], required: true },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "REFUNDED"],
      default: "PENDING",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    deliveryDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    otpSecret: { type: String, required: true },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", OrderSchema);
export default Order;
