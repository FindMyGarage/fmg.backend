const booking = require("../models/booking.model");

const newBooking = async (bookingBody) => {
  return await booking.create(bookingBody);
};

const updateBooking = async (bookingId, bookingBody) => {
  return await booking.findByIdAndUpdate(bookingId, bookingBody, { new: true });
};

const findBooking = async (params) => {
  return await booking.find(params);
};

module.exports = {
  newBooking,
  findBooking,
  updateBooking,
};
