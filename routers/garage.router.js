const { Router } = require("express");
const garageController = require("../controllers/garage.controller");

const router = Router();

router.route("/new").post(garageController.newGarage);

router.route("/find")
  .post(garageController.findCloseGarages);

router.route("/addCamera").post(garageController.addCamera);

router.route("/all").get(garageController.getAllGarages);

module.exports = router;
