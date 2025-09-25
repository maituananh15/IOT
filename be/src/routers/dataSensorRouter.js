const express = require('express');
const router = express.Router();
const dataSensorController = require('../controllers/dataSensorController');

// chỉ đọc dữ liệu
router.get('/latest', dataSensorController.getLatest); // lấy bản ghi mới nhất
router.get('/', dataSensorController.getAll);        // lấy toàn bộ (có thể filter thời gian)


module.exports = router;
