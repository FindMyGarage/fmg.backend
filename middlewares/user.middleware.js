const jwt = require("jsonwebtoken");
const { BAD_REQUEST, UNAUTHORIZED } = require("../utils/messageTypes");
const { getUser } = require("../services/user.service");
const { messageError } = require("../utils/message");

const authenticate = () => {
  return async (req, res, next) => {
    if (req.headers["authentication"] === undefined) {
      return messageError(
        res,
        BAD_REQUEST,
        "No auth token found",
        "AuthenticationError",
      );
    } else {
      try {
        let decoded = "";
        let authorizationHeaderArray = req.headers["authentication"].split(" ");
        if (authorizationHeaderArray[0] !== "Bearer") {
          return messageError(
            res,
            BAD_REQUEST,
            "We dont accept any token other than Bearer",
            "AuthenticationError",
          );
        }
        decoded = jwt.verify(
          authorizationHeaderArray[1],
          String(process.env.JWT_SECRET),
        );
        let user = await getUser({ _id: decoded.user_id });
        if (!user) {
          throw new Error("User not found");
        }
        req.user = user;

        next();
      } catch (err) {
        console.log(err);
        return messageError(
          res,
          UNAUTHORIZED,
          "Expired or invalid token",
          "AuthenticationError",
        );
      }
    }
  };
};

module.exports = {
  authenticate,
};
