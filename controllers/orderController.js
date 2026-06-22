import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import generateSecureOtp from "../utils/otpGenerator.js";
import {
  createEscrowOrder,
  triggerAutomatedRefund,
} from "../services/razorpayService.js";
import { verifyCancellationWindowValidity } from "../utils/dateValidator.js";
import whatsappService from "../services/whatsappService.js";

const completeCheckoutProcess = async (req, res, next) => {
  try {
    const { checkoutItems, selectedAddress, paymentMethod, couponCode } =
      req.body;
    if (!checkoutItems || checkoutItems.length === 0) {
      res.status(400);
      return next(new Error("Processing rejection: Cart items missing."));
    }

    let totalCartBaseSum = 0;
    const structuralItemsArray = [];

    for (const inputItem of checkoutItems) {
      const dbProduct = await Product.findById(inputItem.productId);
      if (!dbProduct) {
        res.status(404);
        return next(
          new Error(
            `Validation failure: Reference product identifier missing.`,
          ),
        );
      }
      totalCartBaseSum += dbProduct.pricePerKg * inputItem.quantity;
      structuralItemsArray.push({
        product: dbProduct._id,
        nameEN: dbProduct.nameEN,
        nameHI: dbProduct.nameHI,
        quantity: inputItem.quantity,
        priceAtPurchase: dbProduct.pricePerKg,
      });
    }

    let discountValue = 0;
    if (couponCode) {
      const targetedCoupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      });
      if (
        targetedCoupon &&
        totalCartBaseSum >= targetedCoupon.minOrderValue &&
        new Date() < targetedCoupon.expiryDate
      ) {
        discountValue =
          (totalCartBaseSum * targetedCoupon.discountPercentage) / 100;
        if (discountValue > targetedCoupon.maxDiscountLimit)
          discountValue = targetedCoupon.maxDiscountLimit;
      }
    }

    const cleanFinalPayableAmount = totalCartBaseSum - discountValue;
    const securityDoorstepOtp = generateSecureOtp();

    let gatewayOrderObj = null;
    if (paymentMethod === "UPI") {
      gatewayOrderObj = await createEscrowOrder(
        cleanFinalPayableAmount,
        `rcpt_${Date.now()}`,
      );
    }

    const operationalOrder = await Order.create({
      customer: req.user._id,
      items: structuralItemsArray,
      totalAmount: totalCartBaseSum,
      discountApplied: discountValue,
      payableAmount: cleanFinalPayableAmount,
      deliveryAddress: selectedAddress,
      paymentMethod,
      razorpayOrderId: gatewayOrderObj ? gatewayOrderObj.id : null,
      otpSecret: securityDoorstepOtp,
    });

    res.status(201).json({ success: true, order: operationalOrder });
  } catch (error) {
    next(error);
  }
};

const evaluateOrderCancellationRequest = async (req, res, next) => {
  try {
    const orderInstance = await Order.findById(req.params.id);
    if (!orderInstance) {
      res.status(404);
      return next(new Error("Target identity data footprint absent."));
    }

    if (orderInstance.customer.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error("Security violation: Resource access denied."));
    }

    if (!verifyCancellationWindowValidity()) {
      res.status(400);
      return next(
        new Error(
          "Business logic validation error: The 9:30 PM cancellation window has closed.",
        ),
      );
    }

    if (orderInstance.status !== "PLACED") {
      res.status(400);
      return next(
        new Error(
          "Transaction lock error: This order is already being processed and cannot be cancelled.",
        ),
      );
    }

    if (
      orderInstance.paymentMethod === "UPI" &&
      orderInstance.paymentStatus === "COMPLETED"
    ) {
      await triggerAutomatedRefund(
        orderInstance.razorpayPaymentId,
        orderInstance.payableAmount,
      );
      orderInstance.paymentStatus = "REFUNDED";
    }

    orderInstance.status = "CANCELLED";
    await orderInstance.save();

    await whatsappService.sendAlert(
      req.user.phone,
      `Your order #${orderInstance._id} has been cancelled successfully.`,
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Order successfully cancelled and financial fields reversed.",
      });
  } catch (error) {
    next(error);
  }
};

export { completeCheckoutProcess, evaluateOrderCancellationRequest };
