const bookingService = require("../services/booking.service");
const { messageCustom } = require("../utils/message");
const { OK, NOT_FOUND, BAD_REQUEST } = require("../utils/messageTypes");
const handleErrors = require("../utils/errorHandler");
const garageService = require("../services/garage.service");

const newGarage = async (req, res) => {
  try {
    const garage = await garageService.newGarage(req.body);

    const return_object = {
      garage,
    };

    messageCustom(res, OK, "Garage created successfully", return_object);
  } catch (error) {
    handleErrors(req, res, error);
  }
};



const addCamera = async (req, res) => {
  try {
    const camera = await garageService.addCamera(req.body);

    const return_object = {
      camera,
    };

    messageCustom(res, OK, "Camera Added successfully", return_object);
  } catch (error) {
    handleErrors(req, res, error);
  }
};

const getAllGarages = async (req, res) => {
  try {
    const garages = await garageService.findGarage({});

    const return_object = {
      garages,
    };

    messageCustom(res, OK, "All garages", return_object);
  } catch (error) {
    handleErrors(req, res, error);
  }
};

const findCloseGarages = async (req, res) => {
  try{

    if(!req.body.latitude || !req.body.longitude){
      throw {
        status: BAD_REQUEST,
        message: "Latitude and longitude not specified"        
      }
    }
    const garages = await garageService.findCloseGarages(req.body);

    const return_object = {
      garages,
    };

    messageCustom(res, OK, "Close garages", return_object);
  }
  catch(error){
    handleErrors(req, res, error);
  }
};

module.exports = {
  newGarage,
  getAllGarages,
  addCamera,
  findCloseGarages
};
