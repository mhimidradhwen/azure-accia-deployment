const router = require("express").Router();
const {
  createPostCtrl,
  GetAllPostsCtrl,
  GetOnePostsCtrl,
  GetPostsCountCtrl,
  DeletePostCtrl,
  UpdatePostCtrl,
  UpdatePhotoPostCtr,
  ToggleLikeCtrl,
} = require("../controllers/postController");
const PhotoUpload = require("../middlewares/PhotoUpload");
const VerifyObjectId = require("../middlewares/VerifyObjectId");
const {
  verifyTokenAndAdmin,
  verifyToken,
} = require("../middlewares/verifyToken");

router
  .route("/")
  .post(verifyTokenAndAdmin, PhotoUpload.single("image"), createPostCtrl)
  .get(GetAllPostsCtrl);
router.route("/count").get(GetPostsCountCtrl);
router
  .route("/Update-photo/:id")
  .put(PhotoUpload.single("image"), UpdatePhotoPostCtr);
router.route("/likes/:id").put(VerifyObjectId, verifyToken, ToggleLikeCtrl);
router
  .route("/:id")
  .get(VerifyObjectId, GetOnePostsCtrl)
  .delete(verifyTokenAndAdmin, VerifyObjectId, DeletePostCtrl)
  .put(verifyTokenAndAdmin, VerifyObjectId, UpdatePostCtrl);

module.exports = router;
