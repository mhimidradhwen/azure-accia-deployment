//Not Found Handler
const notfound = (req, res, next) => {
  const relativePath = req.originalUrl.replace("/api", ""); // Remove '/api' from the originalUrl
  const error = new Error(`not found ${relativePath}`);
  res.status(404);
  error.stack = error.stack.replace(/.*\/([^/]+:\d+).*/g, "$1");
  next(error);
};

//error handler middleware

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
module.exports = {
  errorHandler,
  notfound,
};
