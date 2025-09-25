const DataSensor = require('../models/dataSensorModel');
const dataSensorService = require('../service/dataSensorService');

class DataSensorController {

  // Lấy toàn bộ dữ liệu (tìm kiếm, lọc, sắp xếp, phân trang)
  async getAll(req, res) {
      // Lấy tham số từ query
      const {
        page = 1,
        limit = 10,
        search = "",
        filterType = "",
        sortField = "date",
        sortOrder = "desc",
      } = req.query;
      // Xây dựng filter
      let filter = {};
      // Tìm kiếm & lọc
      if (search) {
        const num = Number(search);
        const isNum = !isNaN(num);
        const date = new Date(search);
        const isDate = !isNaN(date);

        if (!filterType) {
          // Search theo giờ phút giây (HH:mm:ss)
          if (/^\d{2}:\d{2}:\d{2}$/.test(search)) {
            let [hours, minutes, seconds] = search.split(":").map(Number);
            // Chuyển giờ local về UTC (trừ đi 7)
            hours = (hours - 7 + 24) % 24;
            filter = {
              $expr: {
                $and: [
                  { $eq: [{ $hour: "$date" }, hours] },
                  { $eq: [{ $minute: "$date" }, minutes] },
                  { $eq: [{ $second: "$date" }, seconds] },
                ],
              },
            };
          }
          // Search theo giờ phút (HH:mm)
          if (/^\d{2}:\d{2}$/.test(search)) {
            let [hours, minutes] = search.split(":").map(Number);

            // Chuyển giờ local về UTC (trừ đi 7)
            hours = (hours - 7 + 24) % 24;

            filter = {
              $expr: {
                $and: [
                  { $eq: [{ $hour: "$date" }, hours] },
                  { $eq: [{ $minute: "$date" }, minutes] },
                ],
              },
            };
          }
          // Search theo ngày (YYYY-MM-DD)
          else if (/^\d{4}-\d{2}-\d{2}$/.test(search)) {
            filter = {
              date: {
                $gte: new Date(`${search}T00:00:00`),
                $lte: new Date(`${search}T23:59:59`),
              },
            };
          }
          // Search theo ngày giờ đầy đủ (YYYY-MM-DD HH:mm:ss)
          else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(search)) {
            const date = new Date(search);
            filter = {
              date: {
                $gte: date,
                $lt: new Date(date.getTime() + 1000),
              },
            };
          }
          // Search theo số (nhiệt độ/độ ẩm/ánh sáng)
          else if (!isNaN(Number(search))) {
            const num = Number(search);
            filter = {
              $or: [
                { temperature: num },
                { humidity: num },
                { light: num },
              ],
            };
          }
        }
        // Lọc theo loại cảm biến
        else {
          switch (filterType) {
            case "temperature":
              if (isNum) filter.temperature = num;
              break;
            case "humidity":
              if (isNum) filter.humidity = num;
              break;
            case "light":
              if (isNum) filter.light = num;
              break;
          }
        }
      }
      // Phân trang & sort
      const skip = (page - 1) * limit;
      const sortObj = { [sortField]: sortOrder === "asc" ? 1 : -1 };
      // Lấy dữ liệu
      const [data, total] = await Promise.all([
        DataSensor.find(filter).sort(sortObj).skip(skip).limit(Number(limit)),
        DataSensor.countDocuments(filter),
      ]);
      // Trả về kết quả
      res.json({
        data,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
      });
  }
  
  // Lấy dữ liệu mới nhất

  async getLatest(req, res) {
      const latest = await DataSensor.findOne().sort({ date: -1 });
      if (!latest) return res.status(404).json({ message: "No data found" });
      res.json(latest);
  
  }
}

module.exports = new DataSensorController();
