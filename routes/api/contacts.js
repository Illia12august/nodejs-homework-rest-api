const express = require("express");
const {
  listContacts,
  addContact,
  removeContact,
  getById,
  updateContact,
  updateStatusContact,
} = require("../../controllers/contacts");
const isValidId = require("../../middlewares/isValidId");
const authenticate = require("../../middlewares/authenticate");

const router = express.Router();
const jsonParser = express.json();
router.get("/", authenticate, listContacts);

router.get("/:id", authenticate, getById);

router.post("/", authenticate, jsonParser, addContact);

router.delete("/:id", authenticate, isValidId, removeContact);

router.put("/:id", authenticate, isValidId, jsonParser, updateContact);
router.patch(
  "/:id/favorite",
  authenticate,
  isValidId,
  jsonParser,
  updateStatusContact
);
module.exports = router;
