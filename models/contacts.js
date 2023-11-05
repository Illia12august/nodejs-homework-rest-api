const fs = require("fs/promises");
const path = require("path");
const { nanoid } = require("nanoid");
// Розкоментуй і запиши значення
const contactsPath = path.join(__dirname, "contacts.json");
console.log(contactsPath);
// TODO: задокументувати кожну функцію
async function listContacts() {
  const data = await fs.readFile(contactsPath, "utf-8");
  return JSON.parse(data);
}

async function getById(contactId) {
  const contacts = await listContacts();
  const result = contacts.find((item) => item.id === contactId);
  return result || null;
  // ...твій код. Повертає об'єкт контакту з таким id. Повертає null, якщо контакт з таким id не знайдений.
}

// 1 спосіб
// async function removeContact(contactId) {
//   const contacts = await listContacts();
//   const newList = JSON.stringify(contacts.filter((item) => item.id !== contactId), null, 2)
//   await fs.writeFile(
//     contactsPath,
//     newList
//   );
//   const result = contacts.find((item) => item.id === contactId);
//   return result || null;
//   // ...твій код. Повертає об'єкт видаленого контакту. Повертає null, якщо контакт з таким id не знайдений.
// }

// 2 спосіб
async function removeContact(contactId) {
  const contacts = await listContacts();
  const index = contacts.findIndex((item) => item.id === contactId);
  if (index === -1) {
    return null;
  }
  const [result] = contacts.splice(index, 1);
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return result || null
}

async function addContact(name, email, phone) {
  const contacts = await listContacts();
  const newContact = {
    id: nanoid(),
    name,
    email,
    phone,
  };
  contacts.push(newContact);
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2))
  return newContact;
  // ...твій код. Повертає об'єкт доданого контакту.
}

const updateContact = async (contactId, body) => {
  const contacts = await listContacts();
  const index = contacts.findIndex((item) => item.id === contactId);
  if (index === -1) {
    return null;
  }
  if (!body || Object.keys(body).length === 0) {
    return contacts[index];
  }
  contacts[index] = { ...contacts[index], ...body };
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return contacts[index];
};
module.exports = {
  listContacts,
  getById,
  removeContact,
  addContact, 
  updateContact
};