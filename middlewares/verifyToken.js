const jwt = require("jsonwebtoken");
/**
 * @desc verify token 
 */
function verifyToken(req, res, next) {
  const authToken = req.headers.authorization;
  if (authToken) {
    const token = authToken.split(" ")[1];
    try {
      const decodePayload = jwt.verify(token, process.env.JWT_SECRETKEY);
      req.user = decodePayload;
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: "invalid token ,access denied !" });
    }
  } else {
    return res
      .status(401)
      .json({ message: "no token provided ,access denied !" });
  }
}
/**
 * @desc verify token and is admin or not
 */
function verifyTokenAndAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      return res
        .status(403)
        .json({ message: "Access denied ! , only admin have access " });
    }
  });
}

/**
 * @desc verify token and user himself or admin 
 */

function verifyTokenUsersAndAdmin(req, res, next) {
  // Check if req.user exists and contains necessary properties
  verifyToken(req, res, () => {
    if (req.user && (req.user.isAdmin || req.user.id === req.params.id)) {
      next();
    } else {
      return res.status(403).json({
        message: "Not allowed. Only admin or the user themselves are allowed.",
      });
    }
  });
}

module.exports = {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenUsersAndAdmin,
};
