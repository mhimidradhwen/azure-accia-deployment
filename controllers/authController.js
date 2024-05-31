const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const {
  User,
  ValidateRegisterUser,
  validateLoginUser,
} = require("../models/User");

/**--------------------------------------------------------------
 * @des Register new User
 * @router /api/auth/register
 * @method POST
 * @acces public
----------------------------------------------------------------*/
module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
  // 1-validation
  const { error } = ValidateRegisterUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  // 2-is user already exist
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({ message: "user already exist" });
  }
  // 3-hash the password
  const salt = await bcrypt.genSalt();
  const HashPassword = await bcrypt.hash(req.body.password, salt);
  
  // 4-add the new user to the database
  user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: HashPassword,
    grade: req.body.grade,
    jobPosition: req.body.jobPosition,
    currentTask: req.body.currentTask,
    structure: req.body.structure,
    ministry: req.body.ministry,
    birthDay: req.body.birthDay,
    address: req.body.address,
    tel: req.body.tel,
  });
  if (req.body.fax) {
    user.fax = req.body.fax;
  }
  await user.save();

  // 5-send the response the client
  return res
    .status(201)
    .json({ message: "You registered successfully", user: user });
});
/**--------------------------------------------------------------
 * @des login  User
 * @router /api/auth/login
 * @method POST
 * @acces public
----------------------------------------------------------------*/
module.exports.LoginUserCtrl = asyncHandler(async (req, res) => {
  // 1-validation
  const { error } = validateLoginUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  // 2-is user  exist in the database
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }
  // 3-check the password
  const isPasswordMatch = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isPasswordMatch) {
    return res.status(400).json({ message: "verify email or password" });
  }
  // 4-generate token
  const token = user.generateAuthToken();
  // 5-send the response the client
  res.status(200).json({
    user,
    token,
  });
});
