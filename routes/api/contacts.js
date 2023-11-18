const express = require("express");
const {
  listContacts,
  addContact,
  removeContact,
  getById,
  updateContact,
  updateStatusContact,
} = require("../../controllers/contacts");
const isValidId = require("../../models/isValidId");

const router = express.Router();
const jsonParser = express.json();
router.get("/", listContacts);

router.get("/:id", isValidId, getById);

router.post("/", jsonParser, addContact);

router.delete("/:id", isValidId, removeContact);

router.put("/:id", isValidId, jsonParser, updateContact);
router.patch("/:id/favorite", isValidId, jsonParser, updateStatusContact);
module.exports = router;
