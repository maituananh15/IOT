const express = require('express');
const cors = require('cors');
const db = require('./src/config/db');
const userRoutes = require('./src/routers/userRouter');
const dataSensorRoutes = require('./src/routers/dataSensorRouter');
const deviceActionRoutes = require('./src/routers/deviceActionRouter');
const DataSensor = require("./src/models/dataSensorModel");
const DeviceAction = require("./src/models/deviceActionModel");
const mqtt = require('mqtt');
const mqttClient = require('./src/config/db/mqttClient'); 


// ================== APP ==================
const app = express();
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
db.connect();

// API 
app.use('/api/users', userRoutes);
app.use('/api/sensors', dataSensorRoutes);
app.use('/api/device_actions', deviceActionRoutes);

// ================== MQTT ==================
// Trạng thái hiện tại của các thiết bị
let currentStatus = {
  dieuhoa: "OFF",
  quat: "OFF",
  den: "OFF"
};

// Lắng nghe tin nhắn từ MQTT broker
mqttClient.on("message", async (topic, message) => {
  const msg = message.toString();
  console.log(`📥 [${topic}] ${msg}`);

  // ESP32 gửi trạng thái
  if (topic === "esp32/dieuhoa") currentStatus.dieuhoa = msg;
  if (topic === "esp32/quat") currentStatus.quat = msg;
  if (topic === "esp32/den") currentStatus.den = msg;

  console.log("🔄 currentStatus:", currentStatus);

  // ====== Lưu sensor ======
  if (topic === "esp32/datasensor") {
    const regex = /Temperature:\s([\d.]+).*Humidity:\s([\d.]+).*Light:\s(\d+)/;
    const match = msg.match(regex);
    
    // Nếu đúng định dạng thì lưu
    if (match) {
      const temperature = parseFloat(match[1]);
      const humidity = parseFloat(match[2]);
      const light = parseInt(match[3]);

      const data = new DataSensor({
        userId: "68bae24e9954716dfead58f7",
        temperature,
        humidity,
        light,
      });
      await data.save();
    }
  }

  // ====== Lưu lịch sử bật/tắt thiết bị ======
  if (
    topic === "esp32/dieuhoa" ||
    topic === "esp32/quat" ||
    topic === "esp32/den" ||
    topic === "esp32/turnall"
  ) {
    const device = topic.replace("esp32/", "");

    // Chỉ lưu khi trạng thái thay đổi
    if (currentStatus[device] !== msg) {
      const action = new DeviceAction({
        userId: "68bae24e9954716dfead58f7",
        deviceName: device,
        actions: msg,
      });
      await action.save();
      console.log(`💡 Lưu lịch sử: ${device} -> ${msg}`);
    } else {
      console.log(`⚠️ Bỏ qua vì ${device} vẫn giữ trạng thái ${msg}`);
    }
  }
});


// API lấy trạng thái thiết bị
app.get("/api/devices/status", (req, res) => {
  res.json(currentStatus);
});
