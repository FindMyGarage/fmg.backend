const garage = require("../models/garage.model");
const camera = require("../models/camera.model");

const newGarage = async (garageBody) => {
  return await garage.create(garageBody);
};

const updateGarage = async (garageId, garageBody) => {
  return await garage.findByIdAndUpdate(garageId, garageBody, { new: true });
};

const addCamera = async (cameraBody) => {
  const newCamera = await camera.create(cameraBody);
  return newCamera;
};

const findCamera = async (params) => {
  return await camera.findOne(params);
};

const findGarage = async (params) => {
  // return await garage.find(params);
  return await garage.aggregate([
    {
      $match: {
        ...params,
      },
    },
    {
      $lookup: {
        from: "cameras",
        localField: "_id",
        foreignField: "garageId",
        as: "cameras",
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);
};

module.exports = {
  newGarage,
  findGarage,
  addCamera,
  findCamera,
  updateGarage,
};
