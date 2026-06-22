import Product from "../models/Product.js";
import { getRedisClient } from "../config/redis.js";
import { uploadMediaAsset } from "../services/cloudinaryService.js";

const pullFullActiveInventoryCatalog = async (req, res, next) => {
  try {
    const redisClient = getRedisClient();
    if (redisClient && redisClient.isOpen) {
      const cachedOutput = await redisClient.get("veggie_catalog_stream");
      if (cachedOutput)
        return res
          .status(200)
          .json({
            success: true,
            source: "cache_tier",
            data: JSON.parse(cachedOutput),
          });
    }

    const dataModels = await Product.find({ isActive: true });
    if (redisClient && redisClient.isOpen) {
      await redisClient.setEx(
        "veggie_catalog_stream",
        300,
        JSON.stringify(dataModels),
      );
    }
    res
      .status(200)
      .json({ success: true, source: "database_tier", data: dataModels });
  } catch (error) {
    next(error);
  }
};

const executeProductCreationPatch = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      return next(
        new Error(
          "Resource deficit: Product image asset missing from payload.",
        ),
      );
    }
    const { nameEN, nameHI, category, pricePerKg } = req.body;
    const imageSecureUrl = await uploadMediaAsset(req.file.path, "products");

    const structuralProduct = await Product.create({
      nameEN,
      nameHI,
      category,
      pricePerKg,
      imageSecureUrl,
    });
    const redisClient = getRedisClient();
    if (redisClient && redisClient.isOpen)
      await redisClient.del("veggie_catalog_stream");

    res.status(201).json({ success: true, data: structuralProduct });
  } catch (error) {
    next(error);
  }
};

export { pullFullActiveInventoryCatalog, executeProductCreationPatch };
