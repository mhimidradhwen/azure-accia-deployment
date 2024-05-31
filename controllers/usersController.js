const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const {
  User,
  validateLoginUser,
  ValidateUpdateUser,
} = require("../models/User");
const { Comment } = require("../models/Comment");
/**--------------------------------------------------------------------
 * @desc Get All Users 
 * @routes /api/users/profile
 * @method Get
 * @access private Only Admin  
---------------------------------------------------------------------*/
module.exports.GetAllUsersCtrl = asyncHandler(async (req, res) => {
  // 1- Get All users from Database
  const users = await User.find();
  // 2- Send response to client
  res.status(200).json(users);
});

/**--------------------------------------------------------------------
 * @des get User Profile
 * @route /api/users/profile/:id
 * @method GET
 * @access private Only Admin
---------------------------------------------------------------------*/
module.exports.GetUserCtrl = asyncHandler(async (req, res) => {
  // 1- Verify that user exist in the database
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "user not found !" });
  }
  // 2- send the user to the client
  return res.status(200).json(user);
});
/**--------------------------------------------------------------------
 * @des Update User Profile
 * @route /api/users/profile/:id
 * @method PUT
 * @access private (Only User Himself or admin)
---------------------------------------------------------------------*/
module.exports.UpdateUserCtrl = asyncHandler(async (req, res) => {
  const { error } = ValidateUpdateUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const id = req.params.id;

  // Generate hashed password if provided
  let hashedPassword = "";
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10); // Generate salt asynchronously
    hashedPassword = await bcrypt.hash(req.body.password, salt); // Hash password asynchronously
  }

  // Find user before update
  const userBeforeUpdate = await User.findById(id);
  if (!userBeforeUpdate) {
    return res.status(404).json({ message: "user not found" });
  }
  // Update user
  const user = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        firstName: req.body.firstName || userBeforeUpdate.firstName,
        lastName: req.body.lastName || userBeforeUpdate.lastName,
        email: req.body.email || userBeforeUpdate.email,
        password: hashedPassword || userBeforeUpdate.password,
        grade: req.body.grade || userBeforeUpdate.grade,
        jobPosition: req.body.jobPosition || userBeforeUpdate.jobPosition,
        currentTask: req.body.currentTask || userBeforeUpdate.currentTask,
        structure: req.body.structure || userBeforeUpdate.structure,
        ministry: req.body.ministry || userBeforeUpdate.ministry,
        birthDay: req.body.birthDay || userBeforeUpdate.birthDay,
        address: req.body.address || userBeforeUpdate.address,
        tel: req.body.tel || userBeforeUpdate.tel,
        fax: req.body.fax || userBeforeUpdate.fax,
      },
    },
    { new: true }
  ).select("-password -isAdmin -isVerified -profilePhoto -_id");

  return res.status(200).json(user);
});
/**--------------------------------------------------------------------
 * @des Get The number of the users
 * @route /api/admin/users/profile/count
 * @method GET
 * @access private only admin
---------------------------------------------------------------------*/
module.exports.CountUserCtrl = asyncHandler(async (req, res) => {
  // 1- count all users in the database
  const nbUsers = await User.countDocuments();
  // 2- send the response to the client
  return res.status(200).json({ number: nbUsers });
});
/**--------------------------------------------------------------------
 * @desc Upload Photo
 * @route /api/admin/users/profile/profile-photo-upload
 * @method post
 * @access private (only logged in user)
---------------------------------------------------------------------*/
module.exports.UploadPhotoCtrl = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "no file provided" });
  }
  const imagePath = req.file.path;
  const user = await User.findByIdAndUpdate(req.user.id, {
    $set: {
      "profilePhoto.url": imagePath,
    },
  });

  res.status(200).json({ message: "photo Uploaded successfully" });
});
/**--------------------------------------------------------------------
 * @desc delete User Profile
 * @route /api/admin/users/profile/:id
 * @method DELETE
 * @access private (only admin)
---------------------------------------------------------------------*/
module.exports.deleteUserProfileCtrl = asyncHandler(async (req, res) => {
  // 1-get the user from DB
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }

  // 3-delete all comments of this users
  await Comment.deleteMany({ user: user._id });

  // 5-Delete the user
  await User.findByIdAndDelete(req.params.id);
  // 4-delete the pic of the user from the server
  fs.unlinkSync(user.profilePhoto.url);
  // 6- send a response to the client
  res.status(200).json({ message: "user deleted successfully" });
});
