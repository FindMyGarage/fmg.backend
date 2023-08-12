const { Router } = require("express");
const registerController = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/user.middleware");

const router = Router();

router.route("/register").post(registerController.registerUser);

router.route("/login").post(registerController.loginUser);

router.route("/profile").get(authenticate(), registerController.profile);

module.exports = router;
