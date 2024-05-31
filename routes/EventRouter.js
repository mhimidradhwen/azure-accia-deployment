const router=require("express").Router()
const { CreateEventCtrl, GetAllEventCtrl, GetOneEventCtrl, UpdateOneEventCtrl, UpdatePhotoEventCtrl, DeleteOneEventCtrl } = require("../controllers/EventController")
const PhotoUpload = require("../middlewares/PhotoUpload")
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken")


router.route("/")
      .post(PhotoUpload.single("image"),CreateEventCtrl)
      .get(GetAllEventCtrl)
router.route("/update-photo/:id").put(PhotoUpload.single("image"),UpdatePhotoEventCtrl)
router.route("/:id")
      .get(GetOneEventCtrl)
      .put(UpdateOneEventCtrl)
      .delete(DeleteOneEventCtrl)

module.exports = router;
