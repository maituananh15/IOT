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

        const toLocalHour = (h) => (h - 7 + 24) % 24;

        const matchTime = (h, m, s) => ({
          $expr: {
            $and: [
              { $eq: [{ $hour: "$date" }, toLocalHour(h)] },
              ...(m !== undefined ? [{ $eq: [{ $minute: "$date" }, m] }] : []),
              ...(s !== undefined ? [{ $eq: [{ $second: "$date" }, s] }] : []),
            ],
          },
        });

        if (!filterType) {
          if (/^\d{2}(:\d{2}){1,2}$/.test(search)) {
            // Tự động bắt HH:mm hoặc HH:mm:ss
            const [h, m, s] = search.split(":").map(Number);
            filter = matchTime(h, m, s);
          }
          else if (/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$/.test(search)) {
            // YYYY-MM-DD hoặc YYYY-MM-DD HH:mm(:ss)
            const date = new Date(search);
            const next = new Date(date);
            next.setSeconds(next.getSeconds() + 1);

            if (search.length === 10) {
              // chỉ có ngày
              filter = {
                date: {
                  $gte: new Date(`${search}T00:00:00`),
                  $lte: new Date(`${search}T23:59:59`),
                },
              };
            }
            else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(search)) {
              const [datePart, timePart] = search.split(" ");
              const [h, m] = timePart.split(":").map(Number);

              const start = new Date(`${datePart}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`);
              const end = new Date(start);
              end.setMinutes(end.getMinutes() + 1);

              filter = { date: { $gte: start, $lt: end } };
            }

            else {
              // có thêm giờ
              filter = { date: { $gte: date, $lt: next } };
            }

          }
          else if (isNum) {
            filter = {
              $or: [
                { temperature: num },
                { humidity: num },
                { light: num },
              ],
            };
          }
        }
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
            case "date":
              if (isDate) {
                const next = new Date(date);
                next.setSeconds(next.getSeconds() + 1);
                filter.date = { $gte: date, $lt: next };
              }
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
