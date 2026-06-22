import Order from "../models/Order.js";
import whatsappService from "../services/whatsappService.js";

const retrieveDriverZoneDeliveryManifest = async (req, res, next) => {
  try {
    const assignments = await Order.find({
      deliveryDriver: req.user._id,
      status: { $ne: "DELIVERED" },
    }).populate("customer", "name phone");
    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
};

const advanceOrderStatusStep = async (req, res, next) => {
  try {
    const { orderId, targetStatus } = req.body;
    const currentOrder = await Order.findById(orderId).populate("customer");
    if (!currentOrder) {
      res.status(404);
      return next(new Error("Order details not found."));
    }

    currentOrder.status = targetStatus;
    await currentOrder.save();

    if (targetStatus === "OUT_FOR_DELIVERY") {
      await whatsappService.sendAlert(
        currentOrder.customer.phone,
        `Out for delivery! Give code ${currentOrder.otpSecret} to the delivery partner at your doorstep.`,
      );
    }

    res.status(200).json({ success: true, currentStatus: currentOrder.status });
  } catch (error) {
    next(error);
  }
};

const finalizeDoorstepDeliveryViaOtp = async (req, res, next) => {
  try {
    const { orderId, challengeOtp } = req.body;
    const matchingOrder = await Order.findById(orderId).populate("customer");

    if (!matchingOrder || matchingOrder.otpSecret !== challengeOtp) {
      res.status(400);
      return next(
        new Error(
          "Verification error: Provided security OTP does not match. Delivery rejected.",
        ),
      );
    }

    matchingOrder.status = "DELIVERED";
    matchingOrder.paymentStatus = "COMPLETED";
    await matchingOrder.save();

    await whatsappService.sendAlert(
      matchingOrder.customer.phone,
      `Delivered cleanly! Thank you for purchasing.`,
    );
    res
      .status(200)
      .json({
        success: true,
        message:
          "OTP challenge verification successful. Order marked as DELIVERED.",
      });
  } catch (error) {
    next(error);
  }
};

export {
  retrieveDriverZoneDeliveryManifest,
  advanceOrderStatusStep,
  finalizeDoorstepDeliveryViaOtp,
};
