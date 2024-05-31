const router = require("express").Router();
const {
  registerUserCtrl,
  LoginUserCtrl,
} = require("../controllers/authController");
router.route("/register").post(registerUserCtrl);
router.route("/login").post(LoginUserCtrl);
module.exports = router;
