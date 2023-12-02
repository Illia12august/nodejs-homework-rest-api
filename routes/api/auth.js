const express = require("express");

const {
  register,
  login,
  logout,
  getCurrent,
  updateSubscription,
} = require("../../controllers/auth");

const { validateBody } = require("../../middlewares");

const authenticate = require("../../middlewares/authenticate");
const { schemas } = require("../../models/user");

const router = express.Router();

// signup
router.post("/register", validateBody(schemas.registerSchema), register);

// signin
router.post("/login", validateBody(schemas.loginSchema), login);

router.get("/current", authenticate, getCurrent);

router.post("/logout", authenticate, logout);
router.patch(
  "/",
  authenticate,
  validateBody(schemas.subscriprionSchema),
  updateSubscription
);
module.exports = router;
