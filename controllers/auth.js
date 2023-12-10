const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const { User } = require("../models/user");
const fs = require("fs/promises");
const { HttpError, ctrlWrapper } = require("../helpers");
const path = require("path");
const crypto = require("node:crypto");
const SECRET_KEY = process.env.SECRET_KEY;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");
const emailSender = require("../helpers/emailSender");
const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email already in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const verifyToken = crypto.randomUUID();
  await emailSender({
    to: email,
    subject: "Welcome to your contact book",
    html: `To confirm your registration click <a href='http://localhost:3000/api/auth/verify/${verifyToken}'>THIS LINK</a>`,
    text: `To confirm your registration open the link http://localhost:3000/api/auth/verify/${verifyToken}`,
  });
  const avatarURL = gravatar.url(email);
  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verifyToken,
  });

  res.status(201).json({
    email: newUser.email,
    name: newUser.name,
    avatarURL: newUser.avatarURL,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password invalid");
  }

  const payload = {
    id: user._id,
  };
  if (user.verify !== true) {
    return res
      .status(401)
      .send({ message: "your account is not verified yet" });
  }
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
    user,
  });
};

const getCurrent = async (req, res) => {
  const { email, name } = req.user;

  res.json({
    email,
    name,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.json({
    message: "Logout success",
  });
};
async function updateSubscription(req, res, next) {
  const { _id: user } = req.user;

  const userSubscription = await User.findByIdAndUpdate(user, req.body, {
    new: true,
  });

  if (!userSubscription) return next();

  const { email, subscription } = userSubscription;

  res.status(200).json({
    email,
    subscription,
  });
}
const updateAvatar = async (req, res) => {
  try {
    const { _id } = req.user;
    if (req.file === undefined)
      throw HttpError(404, "Image was not found, check form-data values");
    const { path: tempUpload, originalname } = req.file;
    const filename = `${_id}_${originalname}`;
    const resultUpload = path.join(avatarsDir, filename);
    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("avatars", filename);
    await User.findByIdAndUpdate(_id, avatarURL);
    res.json({
      avatarURL,
    });
  } catch (err) {
    res.json(err);
  }
};
const verify = async (req, res, next) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ verifyToken: token }).exec();
    if (user == null) {
      return res.status(404).send({ message: "Not found" });
    }
    await User.findByIdAndUpdate(user._id, { verifyToken: null, verify: true });
  } catch (err) {
    next(err);
  }
  res.status(200).send({ message: "Email confirm successfully" });
};
const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) throw HttpError(401, "Email not found");

  if (user.verify) throw HttpError(400, "Verification has already been passed");

  await emailSender({
    to: email,
    subject: "Welcome to your contact book",
    html: `To confirm your registration click <a href='http://localhost:3000/api/auth/verify/${user.verifyToken}'>THIS LINK</a>`,
    text: `To confirm your registration open the link http://localhost:3000/api/auth/verify/${user.verifyToken}`,
  });

  res.json({
    message: "Verification email sent",
  });
};
module.exports = {
  updateSubscription: ctrlWrapper(updateSubscription),
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateAvatar: ctrlWrapper(updateAvatar),
  verify: ctrlWrapper(verify),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
};
