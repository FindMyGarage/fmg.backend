const mongoose = require("mongoose");

const garageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    address: {
      type: String,
      required: true,
    },
    locationX: {
      type: Number,
      required: true,
    },
    locationY: {
      type: Number,
      required: true,
    },
    slots: [
      {
        name: {
          type: String,
          required: true,
          unique: true,
        },
        type: {
          type: String,
          enum: ["car", "motorbike", "truck"],
          required: true,
        },
        chargePerHour: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          enum: ["available", "occupied", "occupied"],
          default: "available",
        },
      },
    ],
    images: [
      {
        type: String,
      },
    ],
    locationCategory: {
      type: String,
      enum: ["prime", "normal", "outskirt"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const garage = mongoose.model("Garage", garageSchema);

module.exports = garage;
