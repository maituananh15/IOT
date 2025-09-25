const express = require('express');
const router = express.Router();
const deviceActionController = require('../controllers/deviceActionController');

// chỉ đọc dữ liệu
router.get('/', deviceActionController.getAll);        // lấy toàn bộ (có thể filter thời gian)
router.post('/', deviceActionController.createAction);  // tạo mới action

module.exports = router;