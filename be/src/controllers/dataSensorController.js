const DataSensor = require('../models/dataSensorModel');

class DataSensorController {

  // Lấy toàn bộ dữ liệu (tìm kiếm, lọc, sắp xếp, phân trang)
  async getAll(req, res) {
      try {
          const {
            page = 1,
            limit = 10,
            search = "",
            filterType = "",
            sortField = "date",
            sortOrder = "desc",
          } = req.query;

          let filter = {};

          if (search) {
            const num = Number(search);
            const isNum = !isNaN(num);
            const date = new Date(search);
            const isDate = !isNaN(date);

            if (!filterType) {
              if (/^\d{2}:\d{2}:\d{2}$/.test(search)) {
                let [hours, minutes, seconds] = search.split(":").map(Number);
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
              } else if (/^\d{2}:\d{2}$/.test(search)) {
                let [hours, minutes] = search.split(":").map(Number);
                hours = (hours - 7 + 24) % 24;
                filter = {
                  $expr: {
                    $and: [
                      { $eq: [{ $hour: "$date" }, hours] },
                      { $eq: [{ $minute: "$date" }, minutes] },
                    ],
                  },
                };
              } else if (/^\d{4}-\d{2}-\d{2}$/.test(search)) {
                filter = {
                  date: {
                    $gte: new Date(`${search}T00:00:00`),
                    $lte: new Date(`${search}T23:59:59`),
                  },
                };
              } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(search)) {
                const date = new Date(search);
                filter = {
                  date: {
                    $gte: date,
                    $lt: new Date(date.getTime() + 1000),
                  },
                };
              } else if (!isNaN(Number(search))) {
                filter = {
                  $or: [
                    { temperature: num },
                    { humidity: num },
                    { light: num },
                  ],
                };
              }
            } else {
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

          const skip = (page - 1) * limit;
          const sortObj = { [sortField]: sortOrder === "asc" ? 1 : -1 };

          const [data, total] = await Promise.all([
            DataSensor.find(filter).sort(sortObj).skip(skip).limit(Number(limit)),
            DataSensor.countDocuments(filter),
          ]);

          res.json({
            data,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
          });
      } catch (err) {
          res.status(500).json({ message: 'Lỗi server', error: err.message });
      }
  }
  
  // Lấy dữ liệu mới nhất
  async getLatest(req, res) {
      try {
          const latest = await DataSensor.findOne().sort({ date: -1 });
          if (!latest) return res.status(404).json({ message: "No data found" });
          res.json(latest);
      } catch (err) {
          res.status(500).json({ message: 'Lỗi server', error: err.message });
      }
  }
}

module.exports = new DataSensorController();
