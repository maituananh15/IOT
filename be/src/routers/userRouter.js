const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Chỉ có route GET danh sách user
router.get('/', userController.getAllUsers);       // lấy toàn bộ user

module.exports = router;
