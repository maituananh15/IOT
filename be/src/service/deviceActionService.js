const DeviceAction = require('../models/deviceActionModel');

class DeviceActionService {
    // lấy toàn bộ dữ liệu
    async getAllActions(query = {}) {
        return await DeviceAction.find(query).sort({ date: -1 });
    }
    // 👉 thêm hàm tạo action mới
    async createAction(data) {
        const action = new DeviceAction(data);
        return await action.save();
    }
}

module.exports = new DeviceActionService();
