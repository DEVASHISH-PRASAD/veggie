import express from "express";
const router = express.Router();
import {
  retrieveDriverZoneDeliveryManifest,
  advanceOrderStatusStep,
  finalizeDoorstepDeliveryViaOtp,
} from "../controllers/logisticsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

router.get(
  "/driver-manifest",
  protect,
  authorize("driver"),
  retrieveDriverZoneDeliveryManifest,
);
router.post(
  "/update-status",
  protect,
  authorize("admin", "driver"),
  advanceOrderStatusStep,
);
router.post(
  "/verify-otp-delivery",
  protect,
  authorize("driver"),
  finalizeDoorstepDeliveryViaOtp,
);

export default router;
