const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  class: String,
  maSv: { type: String, unique: true },
  linkGithub: String,
  linkPDF: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
