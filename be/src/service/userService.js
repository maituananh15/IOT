const User = require('../models/userModel');

// Lấy tất cả user
const getAllUsers = async () => {
  return await User.find();
};

module.exports = { getAllUsers };
