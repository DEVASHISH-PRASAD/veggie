import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";


import authRoutes from "./routes/authRoutes.js";
import catalogRoutes from "./routes/catalogRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import logisticsRoutes from "./routes/logisticsRoutes.js";

import "./utils/cronJobs.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/logistics", logisticsRoutes);

app.use(notFound);
app.use(errorHandler);

const bootstrap = async () => {
  try {
    await connectDB();
    await connectRedis().catch(() =>
      console.warn(
        "⚠️ Cache tier degradation: Bootstrapping proceeding purely via Mongo instance.",
      ),
    );

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(
        `🚀 System Engine listening smoothly on port ${PORT} in ES-Module mode.`,
      ),
    );
  } catch (err) {
    console.error(`💥 Fatal engine startup interruption: ${err.message}`);
    process.exit(1);
  }
};

bootstrap();
