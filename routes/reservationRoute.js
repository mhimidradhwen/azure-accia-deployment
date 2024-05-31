const router=require("express").Router()
const { CreateReservationCtrl, GetAllReservationCtrl, UpdateReservationCtrl, deleteReservationCtrl } = require("../controllers/reservationController")
const VerifyObjectId = require("../middlewares/VerifyObjectId")
const { verifyToken } = require("../middlewares/verifyToken")

router.route("/:id")
        .post(verifyToken,CreateReservationCtrl)
        .put(UpdateReservationCtrl)
        .delete(deleteReservationCtrl)
        .get(VerifyObjectId,GetAllReservationCtrl)
module.exports=router