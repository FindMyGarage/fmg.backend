const User = require("../models/user.model");
const Booking = require("../models/booking.model");
const mongoose = require("mongoose");

const registerUser = async (userBody) => {
  const user = new User(userBody);
  await user.save();
  return user;
};

const getUser = async (filter) => {
  const user = await User.findOne(filter);
  return user;
};

const getBooking = async (filter) => {
  return Booking.find(filter, null, { sort: { createdAt: -1 } });
};

const profileService = async (userId) => {
  // return await User.aggregate([
  //   {
  //     $match: {
  //       _id: new mongoose.Types.ObjectId(userId),
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "bookings",
  //       localField: "_id",
  //       foreignField: "userId",
  //       as: "bookings",
  //       sort: { createdAt: -1 },
  //     },
  //   },
  //   // sort createdAt of bookings in descending order
  // ]);
  const bookings = await getBooking({ userId });
  let user = await getUser({ _id: userId });
  user = user.toObject();
  user.bookings = bookings;
  return user;
};

module.exports = {
  registerUser,
  getUser,
  profileService,
};
