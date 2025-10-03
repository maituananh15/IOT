

const DeviceAction = require('../models/deviceActionModel');
const mqttClient = require('../config/db/mqttClient');

class DeviceActionController {
    // ✅ Lấy toàn bộ dữ liệu (lọc theo thời gian, phân trang, sort)
    async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                sortField = "date",
                sortOrder = "desc",
                search = "",
                filterDevice = "",
                filterAction = "",
            } = req.query;

            let filter = {};

            if (filterDevice) filter.deviceName = filterDevice;
            if (filterAction) filter.actions = filterAction;

            if (search) {
                if (/^\d{2}:\d{2}:\d{2}$/.test(search)) {
                    let [hours, minutes, seconds] = search.split(":").map(Number);
                    const utcHours = (hours - 7 + 24) % 24;
                    filter.$expr = {
                        $and: [
                            { $eq: [{ $hour: "$date" }, utcHours] },
                            { $eq: [{ $minute: "$date" }, minutes] },
                            { $eq: [{ $second: "$date" }, seconds] },   
                        ],
                    };
                } else if (/^\d{2}:\d{2}$/.test(search)) {
                    let [hours, minutes] = search.split(":").map(Number);
                    const utcHours = (hours - 7 + 24) % 24;
                    filter.$expr = {
                        $and: [
                            { $eq: [{ $hour: "$date" }, utcHours] },
                            { $eq: [{ $minute: "$date" }, minutes] },
                        ],
                    };
                } else if (/^\d{4}-\d{2}-\d{2}$/.test(search)) {
                    const start = new Date(`${search}T00:00:00Z`);
                    const end = new Date(`${search}T23:59:59Z`);
                    filter.date = { $gte: start, $lte: end };
                } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(search)) {
                    const date = new Date(search);
                    filter.date = {
                        $gte: date,
                        $lt: new Date(date.getTime() + 1000),
                    };
                }
            }

            const skip = (page - 1) * limit;
            const sortObj = { [sortField]: sortOrder === "asc" ? 1 : -1 };

            const [data, total] = await Promise.all([
                DeviceAction.find(filter).sort(sortObj).skip(skip).limit(Number(limit)),
                DeviceAction.countDocuments(filter),
            ]);

            res.status(200).json({
                data,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / limit),
            });
        } catch (error) {
            console.error("❌ Lỗi getAll:", error);
            res.status(500).json({ message: error.message });
        }
    }

    // ✅ Tạo action mới (bỏ service, dùng trực tiếp model)
    async createAction(req, res) {
        try {
            const { userId, deviceName, actions } = req.body;
            if (!userId || !deviceName || !actions) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            const newAction = await DeviceAction.create({
                userId,
                deviceName,
                actions,
                date: new Date()
            });

            // publish tới ESP32
            mqttClient.publish(`esp32/${deviceName}`, actions === "ON" ? "ON" : "OFF");

            res.status(201).json(newAction);
        } catch (error) {
            console.error("❌ Lỗi createAction:", error);
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new DeviceActionController();
