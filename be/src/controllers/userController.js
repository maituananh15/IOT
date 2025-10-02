const User = require('../models/userModel'); 

// Controller: Lấy tất cả user
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); 
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { getAllUsers };
