const { Schema, model } = require("mongoose");
const Contactchema = new Schema({
  name: String,
  email: String,
  phone: Number,
});
const Contact = model("contact", Contactchema);
module.exports = Contact;
