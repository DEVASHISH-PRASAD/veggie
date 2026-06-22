import Razorpay from "razorpay";

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createEscrowOrder = async (amountInRupees, receiptId) => {
  try {
    const payload = {
      amount: Math.round(amountInRupees * 100),
      currency: "INR",
      receipt: receiptId.toString(),
    };
    return await instance.orders.create(payload);
  } catch (error) {
    throw new Error(`Razorpay order window generation error: ${error.message}`);
  }
};

const triggerAutomatedRefund = async (paymentId, amountInRupees) => {
  try {
    return await instance.payments.refund(paymentId, {
      amount: Math.round(amountInRupees * 100),
    });
  } catch (error) {
    throw new Error(
      `Razorpay refund pipeline execution error: ${error.message}`,
    );
  }
};

export { createEscrowOrder, triggerAutomatedRefund };
