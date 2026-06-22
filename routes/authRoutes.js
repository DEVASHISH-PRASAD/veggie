import express from "express";
const router = express.Router();
import {
  triggerWhatsAppVerificationOtp,
  finalizeVerificationAndRegister,
  processIdentityLogin,
} from "../controllers/authController.js";
import upload from "../middleware/uploadMiddleware.js";

router.post("/request-otp", triggerWhatsAppVerificationOtp);
router.post(
  "/register",
  upload.single("avatar"),
  finalizeVerificationAndRegister,
);
router.post("/login", processIdentityLogin);

export default router;
