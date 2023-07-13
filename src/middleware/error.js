const logger = require("../logger/devLogger");

const error_404 = function (req, res, next) {
  const error = logger.error("not found");
  error.status = 404;
  next(error);
};

const all_errors = function (error, req, res, next) {
  res.status(error.status || 500);
  logger.error(
    {
      error: { message: error.message },
    },
    error
  );

  next(error);
};
module.exports = { error_404, all_errors };
