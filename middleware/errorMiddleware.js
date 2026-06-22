const notFound = (req, res, next) => {
  const error = new Error(
    `Resource context not discovered at target destination: [${req.originalUrl}]`,
  );
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message:
      err.message || "Internal operational processing failure exception.",
    stack: process.env.NODE_ENV === "production" ? "🔒" : err.stack,
  });
};

export { notFound, errorHandler };
