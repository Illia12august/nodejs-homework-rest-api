const express = require("express");

const {
  register,
  login,
  logout,
  getCurrent,
  updateSubscription,
  updateAvatar,
} = require("../../controllers/auth");

const { validateBody } = require("../../middlewares");
const upload = require("../../middlewares/upload");
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
router.patch("/avatars", authenticate, upload.single("avatar"), updateAvatar);
module.exports = router;
