const asyncHandler = require("express-async-handler")
const { Event } = require("../models/Event");
const { Reservation, ValidateUpdateReservation } = require("../models/Reservation");
const { User } = require("../models/User");

/**--------------------------------------------------------------------
 * @desc create reservation
 * @routes /api/admin/event/reservation/:id
 * @method post
 * @access private only loggin user
---------------------------------------------------------------------*/
module.exports.CreateReservationCtrl = asyncHandler(async (req, res) => {
    // check if the event exist
    const isPresenEvent = await Event.findById(req.params.id);
    if (!isPresenEvent) {
        return res.status(404).json({ message: "event does not exist" })
    }
    // Check if the user has an account
    const isPresentUser = await User.findById(req.user.id)
    if (!isPresentUser) {
        return res.status(404).json({ message: "User Not Found !" })
    }

    const isReservationPresent = await Reservation.findOne({ UserId: isPresentUser.id });
    if (isReservationPresent) {
        return res.status(409).json({ message: "Reservation exists in the database" });
    } 
  

    const newReservation = await Reservation.create({
        EventId: isPresenEvent.id,
        UserId: isPresentUser.id,
        date: new Date(),
        isPresent: false
    })
    //send response to the client
    return res.status(200).json({ message: "reservation created successfully", reservation: newReservation });

})
/**--------------------------------------------------------------------
 * @desc Update reservation
 * @routes /api/admin/event/reservation/:id
 * @method put
 * @access private only admin
---------------------------------------------------------------------*/
module.exports.UpdateReservationCtrl = asyncHandler(async (req, res) => {
    // Validate data
    const { error } = ValidateUpdateReservation(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    // Verify if the reservation exists
    const isPresentReservation = await Reservation.findById(req.params.id)
    if (!isPresentReservation) {
        return res.status(404).json({ message: "Resgistration not found" })
    }
    // Modify the reservation
    await Reservation.findByIdAndUpdate(req.params.id, {
        $set: {
            isPresent: req.body.isPresent
        }
    })
    // Send a request to the client
    return res.status(200).json({ message: "reservation updated successfully" });

})
/**--------------------------------------------------------------------
 * @desc delete reservation
 * @routes /api/admin/event/reservation/:id
 * @method delete
 * @access private only admin
---------------------------------------------------------------------*/
module.exports.deleteReservationCtrl = asyncHandler(async (req, res) => {
    //verify if the reservation exists
    const isPresentReservation = await Reservation.findByIdAndUpdate(req.params.id);
    if (!isPresentReservation) {
        return res.status(404).json({ message: "reservation not found" })
    }
    //delete the reservation 
    await Reservation.findByIdAndDelete(req.params.id)
    //send request to the client
    return res.status(200).json({ message: "reservation deleted successfully" })
})
/**--------------------------------------------------------------------
 * @desc get all reservation
 * @routes /api/admin/event/reservation/
 * @method get
 * @access private only admin
---------------------------------------------------------------------*/
module.exports.GetAllReservationCtrl = asyncHandler(async (req, res) => {
    // Define the number of reservations per page
    const RESERVATION_PER_PAGE = 8;

    // Extract the page number from the query parameters
    const { numberPage } = req.query;

    let reservation;
    // If a page number is provided, paginate the results
    if (numberPage) {
        reservation = await Reservation.find({EventId:req.params.id})
            .skip((numberPage - 1) * RESERVATION_PER_PAGE)
            .limit(RESERVATION_PER_PAGE)
            .sort({ createdAt: -1 })
            .populate("UserId")
            .populate("EventId");
    } else {
        // Otherwise, retrieve all reservations
        reservation = await Reservation.find({EventId:req.params.id})
            .sort({ createdAt: -1 })
            .populate("UserId")
            .populate("EventId");
    }

    // Check if reservations were found
    if (!reservation || reservation.length === 0) {
        return res.status(404).json({ message: "No reservations found" });
    }

    // Return the reservations
    return res.status(200).json(reservation);
});
