const router = require("express").Router();
const {
  CreateCommentCtrl,
  GetAllCommentCtrl,
  deleteCommentCtrl,
  UpdateCommentCtrl,
} = require("../controllers/commentController");
const VerifyObjectId = require("../middlewares/VerifyObjectId");
const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenUsersAndAdmin,
} = require("../middlewares/verifyToken");

router.route("/").post(verifyToken, CreateCommentCtrl)
router
  .route("/:id")
  .delete(VerifyObjectId, verifyTokenUsersAndAdmin, deleteCommentCtrl)
  .put(VerifyObjectId, verifyToken, UpdateCommentCtrl)
  .get(GetAllCommentCtrl);
module.exports = router;
