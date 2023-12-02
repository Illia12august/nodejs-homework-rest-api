// const fs = require("fs/promises");
const Contact = require("../models/contact");
const { contactSchema, favoriteSchema } = require("../joi_schemas/joi_schemas");
const { HttpError } = require("../helpers");

// const { nanoid } = require("nanoid");
// Розкоментуй і запиши значення
// TODO: задокументувати кожну функцію

async function listContacts(req, res) {
  const { _id: owner } = req.user;

  const { page = 1, limit = 10, favorite } = req.query;
  const skip = (page - 1) * limit;

  const query = { owner };

  if (favorite === "true") {
    query.favorite = true;
  }

  const data = await Contact.find(query, "-createdAt -updatedAt", {
    skip,
    limit,
  }).populate("owner", "email");

  res.json(data);
}

async function getById(req, res, next) {
  const { id } = req.params;
  const { _id } = req.user;

  const contact = await Contact.findById(id);

  if (!contact) {
    return next(HttpError(404, "Contact not found"));
  }

  const verifiedContact =
    contact.owner.toString() === _id.toString()
      ? contact
      : next(HttpError(404, "Contact not found"));

  res.json(verifiedContact);
  // ...твій код. Повертає об'єкт контакту з таким id. Повертає null, якщо контакт з таким id не знайдений.
}

// // 1 спосіб
// // async function removeContact(contactId) {
// //   const contacts = await listContacts();
// //   const newList = JSON.stringify(contacts.filter((item) => item.id !== contactId), null, 2)
// //   await fs.writeFile(
// //     contactsPath,
// //     newList
// //   );
// //   const result = contacts.find((item) => item.id === contactId);
// //   return result || null;
// //   // ...твій код. Повертає об'єкт видаленого контакту. Повертає null, якщо контакт з таким id не знайдений.
// // }

// // 2 спосіб
async function removeContact(req, res, next) {
  try {
    const { id } = req.params;

    const deletedContact = await Contact.findByIdAndDelete(id);
    console.log(deletedContact);

    if (!deletedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ message: "Contact deleted" });
  } catch (error) {
    next(error);
  }
}

async function addContact(req, res, next) {
  const { _id: owner } = req.user;
  try {
    const validation = contactSchema.validate(req.body);

    if (validation.error) {
      const errorMessage = validation.error.details
        .map((error) => error.message)
        .join(", ");
      return res
        .status(400)
        .json({ message: `Validation Error: ${errorMessage}` });
    }

    const newContact = new Contact({
      ...req.body,
      owner,
    });

    const savedContact = await newContact.save();

    res.status(201).json(savedContact);
  } catch (error) {
    next(error);
  }
  // ...твій код. Повертає об'єкт доданого контакту.
}

const updateContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const validation = contactSchema.validate(req.body);

    if (validation.error) {
      const errorMessage = validation.error.details
        .map((error) => error.message)
        .join(", ");
      return res
        .status(400)
        .json({ message: `Validation Error: ${errorMessage}` });
    }

    const updateContact = await Contact.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone,
      },
      { new: true }
    );

    if (!updateContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json(updateContact);
  } catch (error) {
    next(error);
  }
};

async function updateStatusContact(req, res, next) {
  try {
    const { id } = req.params;
    const { favorite } = req.body;

    const favoriteValidation = favoriteSchema.validate(
      { favorite },
      { abortEarly: false }
    );
    if (favoriteValidation.error) {
      const errorMessage = favoriteValidation.error.details
        .map((error) => error.message)
        .join(", ");
      return res
        .status(400)
        .json({ message: `Validation Error: ${errorMessage}` });
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      {
        favorite,
      },
      { new: true }
    );

    if (updatedContact === null) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listContacts,
  getById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
