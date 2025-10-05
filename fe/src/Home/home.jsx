import { useState, useEffect } from "react";
import { TbAirConditioningDisabled, TbAirConditioning } from "react-icons/tb";
import { FaTemperatureLow, FaLightbulb, FaFan } from "react-icons/fa";
import { WiHumidity } from "react-icons/wi";
import Layout from "../Layouts/layout.jsx";
import "./home.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function Home() {
  // 👉 State quản lý trạng thái thiết bị và dữ liệu cảm biến
  const [fanOn, setFanOn] = useState(false);
  const [acOn, setAcOn] = useState(false);
  const [lightOn, setLightOn] = useState(false);

  const [fanLoading, setFanLoading] = useState(false);
  const [acLoading, setAcLoading] = useState(false);
  const [lightLoading, setLightLoading] = useState(false);

  const [data, setData] = useState([]);
  const [esp32Status, setEsp32Status] = useState("DISCONNECTED");

  // 👉 Theo dõi trạng thái kết nối ESP32
  useEffect(() => {
    const checkESP32Status = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/devices/status");
        const json = await res.json();

        // Nếu trạng thái ESP32 thay đổi từ DISCONNECTED → CONNECTED
        if (esp32Status === "DISCONNECTED" && json.esp32Status === "CONNECTED") {
          // Reset tất cả thiết bị về OFF khi vừa cắm lại
          setFanOn(false);
          setAcOn(false);
          setLightOn(false);
          console.log("🔄 ESP32 reconnected — all devices reset to OFF");
        }

        setFanOn(json.quat === "ON");
        setAcOn(json.dieuhoa === "ON");
        setLightOn(json.den === "ON");
        setEsp32Status(json.esp32Status);
      } catch (err) {
        console.error("❌ Lỗi fetch device status:", err);
      }
    };

    checkESP32Status();
    const interval = setInterval(checkESP32Status, 5000);
    return () => clearInterval(interval);
  }, [esp32Status]);

  // 👉 Lấy dữ liệu cảm biến định kỳ
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/sensors/latest");
        const json = await res.json();

        if (json && json.date) {
          setData((prev) => {
            const updated = [
              ...prev,
              {
                time: new Date(json.date).toLocaleTimeString(),
                temperature: json.temperature,
                humidity: json.humidity,
                light: json.light,
              },
            ];
            return updated.length > 5 ? updated.slice(-5) : updated;
          });
        }
      } catch (err) {
        console.error("❌ Lỗi fetch data:", err);
      }
    };

    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const latestData =
    data.length > 0
      ? data[data.length - 1]
      : {
        temperature: "--",
        humidity: "--",
        light: "--",
      };

  // 👉 Hàm fetch có timeout
  const fetchWithTimeout = (url, options, timeout = 3000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("⏰ Timeout")), timeout)
      ),
    ]);
  };

  // 👉 Hàm điều khiển thiết bị
  const toggleDevice = async (device, desiredState, setDeviceState, setLoading) => {
    setLoading(true);

    if (esp32Status === "DISCONNECTED") {
      setTimeout(() => {
        setDeviceState(false);
        setLoading(false);
        alert(`⚠️ Thiết bị ${device} không phản hồi — ESP32 mất kết nối!`);
      }, 10000);
      return;
    }

    try {
      const res = await fetchWithTimeout(
        "http://localhost:5000/api/device_actions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "68bae24e9954716dfead58f7",
            deviceName: device,
            actions: desiredState ? "ON" : "OFF",
          }),
        },
        9000
      );

      if (!res.ok) throw new Error("API lỗi");

      // ✅ Nếu API OK → bật/tắt thành công
      setDeviceState(desiredState);
      console.log(`💡 ${device} -> ${desiredState ? "ON" : "OFF"}`);
    } catch (err) {
      console.error("❌ Lỗi gửi lệnh:", err.message);
      setDeviceState(false);
      setEsp32Status("DISCONNECTED");
      alert(`⚠️ Thiết bị ${device} không phản hồi — ESP32 mất kết nối!`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Layout />
      <div className="content">
        <div className="esp32-status text-center mb-3">
          {esp32Status === "CONNECTED" ? (
            <span className="badge bg-success">🟢 ESP32 Connected</span>
          ) : (
            <span className="badge bg-danger">🔴 ESP32 Disconnected</span>
          )}
        </div>

        <div className="container">
          {/* Header hiển thị thông số */}
          <div className="content-header">
            {/* Temperature */}
            <div
              className="content-temperature"
              style={{
                backgroundColor:
                  latestData.temperature < 15
                    ? "rgb(51,134,236)"
                    : latestData.temperature < 30
                      ? "rgb(233, 121, 24)"
                      : "rgb(230, 34, 34)",
              }}
            >
              <FaTemperatureLow size={50} />
              <span>
                <h3>Temperature</h3>
                <p>{latestData.temperature}°C</p>
              </span>
            </div>

            {/* Humidity */}
            <div
              className="content-humidity"
              style={{
                backgroundColor:
                  latestData.humidity < 40
                    ? "orange"
                    : latestData.humidity < 70
                      ? "rgb(156,201,73)"
                      : "rgb(51,134,236)",
              }}
            >
              <WiHumidity size={50} />
              <span>
                <h3>Humidity</h3>
                <p>{latestData.humidity}%</p>
              </span>
            </div>

            {/* Light */}
            <div
              className="content-light"
              style={{
                backgroundColor:
                  latestData.light < 100
                    ? "gray"
                    : latestData.light < 500
                      ? "#89e31a"
                      : "rgb(255,215,0)",
              }}
            >
              <FaLightbulb size={50} />
              <span>
                <h3>Light</h3>
                <p>{latestData.light} Lux</p>
              </span>
            </div>
          </div>

          {/* Biểu đồ + điều khiển */}
          <div className="content-main container mt-2">
            <div className="row">
              {/* Biểu đồ */}
              <div className="col-9">
                <ResponsiveContainer width="100%" height={470}>
                  <LineChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#ff7300"
                      name="Temperature (°C)"
                    />
                    <Line
                      type="monotone"
                      dataKey="humidity"
                      stroke="#387908"
                      name="Humidity (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="light"
                      stroke="#8884d8"
                      name="Light (lx)"
                    />
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Điều khiển */}
              <div className="col-3">
                {/* Quạt */}
                <div className="control-fan mb-1">
                  <FaFan className={`icon ${fanOn ? "spin" : ""}`} />
                  <span> Quạt </span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={fanOn}
                      disabled={fanLoading}
                      onChange={() =>
                        toggleDevice("quat", !fanOn, setFanOn, setFanLoading)
                      }
                    />
                    <span className="slider round"></span>
                  </label>
                  {fanLoading && (
                    <div
                      className="spinner-border spinner-border-sm text-primary ms-2"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  )}
                </div>

                {/* Điều hòa */}
                <div className="control-air mb-3">
                  <span className="me-2">
                    {acOn ? (
                      <TbAirConditioning size={55} />
                    ) : (
                      <TbAirConditioningDisabled size={55} />
                    )}
                  </span>
                  <span>Điều hòa</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={acOn}
                      disabled={acLoading}
                      onChange={() =>
                        toggleDevice("dieuhoa", !acOn, setAcOn, setAcLoading)
                      }
                    />
                    <span className="slider round"></span>
                  </label>
                  {acLoading && (
                    <div
                      className="spinner-border spinner-border-sm text-info ms-2"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  )}
                </div>

                {/* Đèn */}
                <div className="control-light mb-3">
                  <FaLightbulb
                    className={`icon ${lightOn ? "led-on" : ""}`}
                  />
                  <span>Đèn</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={lightOn}
                      disabled={lightLoading}
                      onChange={() =>
                        toggleDevice("den", !lightOn, setLightOn, setLightLoading)
                      }
                    />
                    <span className="slider round"></span>
                  </label>
                  {lightLoading && (
                    <div
                      className="spinner-border spinner-border-sm text-warning ms-2"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
