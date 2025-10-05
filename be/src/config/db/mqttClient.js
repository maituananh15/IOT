// src/mqttClient.js
const mqtt = require("mqtt");

// Thông tin kết nối MQTT broker
const host = "192.168.1.9";
const port = "1883";
const username = "admin123";
const password = "12345678Az";

// Tạo client MQTT
const connectUrl = `mqtt://${host}:${port}`;
const client = mqtt.connect(connectUrl, {
  username,
  password,
  clientId: "mqttjs_" + Math.random().toString(16).substr(2, 8),
  clean: true,
  reconnectPeriod: 5000, // ⏳ Tự động thử kết nối lại mỗi 5s
});

// ✅ Khi kết nối thành công
client.on("connect", () => {
  console.log("✅ MQTT connected!");
  client.subscribe("esp32/datasensor");
  client.subscribe("esp32/dieuhoa");
  client.subscribe("esp32/quat");
  client.subscribe("esp32/den");
  client.subscribe("esp32/turnall");
  client.subscribe("esp32/status");
  console.log("📡 Đang lắng nghe dữ liệu & điều khiển...");
});

module.exports = client;
