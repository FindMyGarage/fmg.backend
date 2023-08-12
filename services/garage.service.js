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

const findCloseGarages = async (params) => {
  // get 10 closest garages with non zero slots

  // we need to find euclidian distance between two points.
  // we get lat and long from params and then we find the distance between them
  // using locationX and locationY of the garages

  // step 1: take locationX and locationY from params and calculate distance between them
  // and all the garages in the database

  // step 2: sort the garages by distance and remove slots == 0

  // step 3: return the first limit garages

  // console.log(params);
  limit = params.limit ? params.limit : 10;
  radius = params.radius ? params.radius : 5;

  const garages = await garage.aggregate([
    {
      // distance should be less than params.radius
      $addFields: {
        distance: {
          $sqrt: {
            $add: [
              { $pow: [{ $subtract: ["$locationX", params.latitude] }, 2] },
              { $pow: [{ $subtract: ["$locationY", params.longitude] }, 2] },
            ],
          },
        },
      },
    },
    {
      $match: {
        distance: {
          $lte: radius / 100,
        },
      },
    },
    // inside slots we need to check if there is any slot with status available
    // and count if > 0
    // {
    //   $match: {
    //     slots: {
    //       $elemMatch: {
    //         status: "available"
    //       },
    //       // $gt: 0
    //     },
    //   }
    // },
    {
      $sort: {
        distance: 1,
      },
    },
    {
      $limit: limit,
    },
  ]);

  return garages;
};

module.exports = {
  newGarage,
  findGarage,
  addCamera,
  findCamera,
  updateGarage,
  findCloseGarages,
};
