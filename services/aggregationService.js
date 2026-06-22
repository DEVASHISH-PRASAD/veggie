import Order from "../models/Order.js";

const runMunderaMandiAggregation = async () => {
  try {
    console.log(
      "⚡ Running programmatic compilation routines for Mandi bulk tracking profiles...",
    );
    const pipeline = [
      { $match: { status: "PLACED" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          vegetableNameEN: { $first: "$items.nameEN" },
          vegetableNameHI: { $first: "$items.nameHI" },
          aggregatedTotalWeightKg: { $sum: "$items.quantity" },
        },
      },
    ];
    const aggregatedResult = await Order.aggregate(pipeline);
    console.log("📊 COMPILED DEMAND ARRAYS FOR ADMINISTRATIVE LOGISTICS:");
    console.table(aggregatedResult);

    await Order.updateMany(
      { status: "PLACED" },
      { $set: { status: "PROCURING" } },
    );
    return aggregatedResult;
  } catch (error) {
    console.error(
      `❌ Critical failure compiling aggregations: ${error.message}`,
    );
  }
};

export { runMunderaMandiAggregation };
