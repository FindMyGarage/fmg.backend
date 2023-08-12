const { Router } = require("express");
const bookingController = require("../controllers/booking.controller");

const router = Router();

router.route("/accept").post(bookingController.acceptBooking);

module.exports = router;
