const express = require("express");

const {
  register,
  login,
  logout,
  getCurrent,
  updateSubscription,
  updateAvatar,
  verify,
  resendVerifyEmail,
} = require("../../controllers/auth");

const { validateBody } = require("../../middlewares");
const upload = require("../../middlewares/upload");
const authenticate = require("../../middlewares/authenticate");
const { schemas } = require("../../models/user");
const { emailSchema } = require("../../joi_schemas/joi_schemas");

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
router.get("/verify/:token", verify);
router.post("/verify", validateBody(emailSchema), resendVerifyEmail);
module.exports = router;
