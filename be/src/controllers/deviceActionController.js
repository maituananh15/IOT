
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

    // ✅ createAction có cơ chế đợi ESP32 phản hồi
    async createAction(req, res) {
        try {
            
            const { userId, deviceName, actions } = req.body;
            if (!userId || !deviceName || !actions) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            // Gửi lệnh xuống ESP32 qua MQTT
            mqttClient.publish(`esp32/${deviceName}`, actions);

            // Flag kiểm tra đã phản hồi chưa
            let responded = false;

            // Timeout sau 8 giây
            const timer = setTimeout(() => {
                if (!responded) {
                    return res.status(504).json({ message: "⚠️ Device not responding" });
                }
            }, 8000);

            // Đợi phản hồi từ ESP32
            mqttClient.once("message", async (topic, message) => {
                if (topic === `esp32/${deviceName}`) {
                    responded = true;
                    clearTimeout(timer);

                    // Lưu action
                    const newAction = await DeviceAction.create({
                        userId,
                        deviceName,
                        actions,
                        date: new Date()
                    });

                    return res.status(201).json(newAction);
                }
            });
        } catch (error) {
            console.error("❌ Lỗi createAction:", error);
            res.status(500).json({ message: error.message });
        }
    }

}

module.exports = new DeviceActionController();
