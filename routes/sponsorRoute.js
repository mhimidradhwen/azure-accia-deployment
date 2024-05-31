const router=require("express").Router()
const { CreateSponsorCtrl } = require("../controllers/sponsorController")
const PhotoUpload = require("../middlewares/PhotoUpload")


router.route("/").post(PhotoUpload.single("image"), CreateSponsorCtrl)

module.exports=router