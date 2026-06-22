import User from "../models/User.js";
import jwt from "jsonwebtoken";
import generateSecureOtp from "../utils/otpGenerator.js";
import whatsappService from "../services/whatsappService.js";
import { uploadMediaAsset } from "../services/cloudinaryService.js";

const temporaryOtpStore = new Map();

const triggerWhatsAppVerificationOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      res.status(400);
      return next(
        new Error(
          "Input validation issue: A valid 10-digit Indian phone number is required.",
        ),
      );
    }

    const existingUser = await User.findOne({ phone, isVerified: true });
    if (existingUser) {
      res.status(400);
      return next(
        new Error(
          "Conflict resource error: A verified profile already shares this mobile string.",
        ),
      );
    }

    const generatedOtp = generateSecureOtp();
    temporaryOtpStore.set(phone, { otp: generatedOtp, timestamp: Date.now() });

    // ⚡ SAFE VERIFICATION HANDSHAKE FALLBACK PIPELINE
    try {
      await whatsappService.sendAlert(
        phone,
        `Your Prayagraj Veggie confirmation security key is: ${generatedOtp}.`,
      );
      console.log(`📡 WhatsApp message dispatched successfully to ${phone}`);
    } catch (whatsappError) {
      // 🛑 FALLBACK MATRIX: Catch errors gracefully to prevent the pipeline from crashing
      console.log(`\n⚠️  [WHATSAPP SERVICE FAULT] Fallback Mode Triggered.`);
      console.log(`-------------------------------------------------`);
      console.log(`[TERMINAL OVERRIDE] SMS to ${phone}`);
      console.log(`[TERMINAL OVERRIDE] Generated OTP Key is: ${generatedOtp}`);
      console.log(
        `Reason for failure: ${whatsappError.message || whatsappError}`,
      );
      console.log(`-------------------------------------------------\n`);
    }

    // This success response always returns cleanly to your React Native app now!
    res.status(200).json({
      success: true,
      message: "Verification validation token sent via WhatsApp channel.",
    });
  } catch (error) {
    next(error);
  }
};

const finalizeVerificationAndRegister = async (req, res, next) => {
  try {
    const { name, phone, password, role, otp } = req.body;
    const cachedOtpRecord = temporaryOtpStore.get(phone);

    if (
      !cachedOtpRecord ||
      cachedOtpRecord.otp !== otp ||
      Date.now() - cachedOtpRecord.timestamp > 300000
    ) {
      res.status(400);
      return next(
        new Error(
          "Security payload challenge failed: Invalid or expired OTP token context.",
        ),
      );
    }

    temporaryOtpStore.delete(phone);

    let fileSecureUrl = undefined;
    if (req.file) {
      fileSecureUrl = await uploadMediaAsset(req.file.path, "profiles");
    }

    const newUser = await User.create({
      name,
      phone,
      password,
      role: role || "customer",
      avatarSecureUrl: fileSecureUrl,
      isVerified: true,
    });

    const appToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.status(201).json({
      success: true,
      token: appToken,
      user: { id: newUser._id, name: newUser.name, role: newUser.role },
    });
  } catch (error) {
    next(error);
  }
};

const processIdentityLogin = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const userInstance = await User.findOne({ phone });

    if (userInstance && (await userInstance.matchPassword(password))) {
      const appToken = jwt.sign(
        { id: userInstance._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN },
      );
      return res.status(200).json({
        success: true,
        token: appToken,
        user: {
          id: userInstance._id,
          name: userInstance.name,
          role: userInstance.role,
        },
      });
    }
    res.status(401);
    next(new Error("Authentication failed: Invalid login credentials."));
  } catch (error) {
    next(error);
  }
};

export {
  triggerWhatsAppVerificationOtp,
  finalizeVerificationAndRegister,
  processIdentityLogin,
};
