import redis from "redis";
let redisClient = null;

const connectRedis = async () => {
  // Pass the legacy protocol override parameter right here
  redisClient = redis.createClient({
    url: process.env.REDIS_URL,
    RESP: 2,
  });

  redisClient.on("error", (err) =>
    console.error("Redis Runtime Processing Exception:", err),
  );
  await redisClient.connect();
  console.log("⚡ Redis dynamic caching matrix connected successfully.");
  return redisClient;
};

const getRedisClient = () => redisClient;

export { connectRedis, getRedisClient };
