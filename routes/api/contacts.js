const express = require("express");
const {
  listContacts,
  addContact,
  removeContact,
  getById,
  updateContact,
  updateStatusContact,
} = require("../../controllers/contacts");

const router = express.Router();
const jsonParser = express.json();
router.get("/", listContacts);

router.get("/:id", getById);

router.post("/", jsonParser, addContact);

router.delete("/:id", removeContact);

router.put("/:id", jsonParser, updateContact);
router.patch("/:id/favorite", jsonParser, updateStatusContact);
module.exports = router;
