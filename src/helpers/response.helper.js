// helpers/response.helper.js
const responseSuccess = (data, message, statusCode = 200) => {
  return {
    status: "Success",
    statusCode,
    message,
    data,
  };
};

const responseError = (
  message = "Internal server error",
  statusCode = 500,
  stack = null
) => {
  return {
    status: "Error",
    statusCode,
    message,
    stack: stack,
  };
};

module.exports = {
  responseSuccess,
  responseError,
};
