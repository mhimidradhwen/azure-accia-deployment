const router = require("express").Router();
const {
  GetAllUsersCtrl,
  GetUserCtrl,
  UpdateUserCtrl,
  CountUserCtrl,
  UploadPhotoCtrl,
} = require("../controllers/usersController");
const PhotoUpload = require("../middlewares/PhotoUpload");
const VerifyObjectId = require("../middlewares/VerifyObjectId");
const {
  verifyTokenAndAdmin,
  verifyTokenUsersAndAdmin,
} = require("../middlewares/verifyToken");

//count the number of the users

router.route("/profile/count").get(verifyTokenAndAdmin, CountUserCtrl);

//upload the Album or photo

router
  .route("/profile/profile-photo-upload")
  .post(verifyTokenUsersAndAdmin, PhotoUpload.single("image"), UploadPhotoCtrl);

//api/users/profile

router.route("/profile").get(verifyTokenAndAdmin, GetAllUsersCtrl);
router
  .route("/profile/:id")
  .get(VerifyObjectId, verifyTokenAndAdmin, GetUserCtrl)
  .put(VerifyObjectId, verifyTokenUsersAndAdmin, UpdateUserCtrl);

module.exports = router;
