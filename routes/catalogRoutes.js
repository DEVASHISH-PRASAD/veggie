import express from "express";
const router = express.Router();
import {
  pullFullActiveInventoryCatalog,
  executeProductCreationPatch,
} from "../controllers/catalogController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

router.get("/", pullFullActiveInventoryCatalog);
router.post(
  "/",
  protect,
  authorize("admin"),
  upload.single("productImage"),
  executeProductCreationPatch,
);

export default router;
