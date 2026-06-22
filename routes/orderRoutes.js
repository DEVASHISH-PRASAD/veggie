import express from "express";
const router = express.Router();
import {
  completeCheckoutProcess,
  evaluateOrderCancellationRequest,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

router.post("/checkout", protect, completeCheckoutProcess);
router.post("/:id/cancel", protect, evaluateOrderCancellationRequest);

export default router;
