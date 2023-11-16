// const fs = require("fs/promises");
const path = require("path");
const Contact = require("../models/contact");
const { ContactSchema, favoriteSchema } = require("../joi_schemas/joi_schemas");
// const { nanoid } = require("nanoid");
// Розкоментуй і запиши значення
const contactsPath = path.join(__dirname, "contacts.json");
console.log(contactsPath);
// TODO: задокументувати кожну функцію
async function listContacts(req, res, next) {
  try {
    const contacts = await Contact.find().exec();
    res.send(contacts);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  const { id } = req.params;

  try {
    const contact = await Contact.findById(id).exec();
    if (contact === null) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.send(contact);
  } catch (error) {
    next(error);
  }
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
  try {
    const { name, email, phone } = req.body;

    const validation = ContactSchema.validate(req.body, { abortEarly: false });

    if (validation.error) {
      const errorMessage = validation.error.details
        .map((error) => error.message)
        .join(", ");
      return res
        .status(400)
        .json({ message: `Validation Error: ${errorMessage}` });
    }

    const newContact = new Contact({
      name,
      email,
      phone,
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

    const validation = ContactSchema.validate(req.body, { abortEarly: false });

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
