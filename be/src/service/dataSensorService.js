const DataSensor = require('../models/dataSensorModel');

class DataSensorService {
  // lấy toàn bộ dữ liệu, có thể filter theo query (ví dụ thời gian)
  async getAllSensors(query = {}) {
    return await DataSensor.find(query).sort({ date: -1 });
  }
  // lấy dữ liệu mới nhất
  async getLatestSensor() {
    return await DataSensor.findOne().sort({ date: -1 });
  }
}

module.exports = new DataSensorService();
