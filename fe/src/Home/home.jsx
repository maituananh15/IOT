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
  const [data, setData] = useState([]);

  // 👉 Lấy dữ liệu cảm biến từ API
  useEffect(() => {
    const fetchDeviceStatus = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/devices/status");
        const json = await res.json();
        setFanOn(json.quat === "ON");
        setAcOn(json.dieuhoa === "ON");
        setLightOn(json.den === "ON");
      } catch (err) {
        console.error("❌ Lỗi fetch device status:", err);
      }
    };
    // gọi hàm lấy trạng thái thiết bị khi component được mount
    fetchDeviceStatus();
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/sensors/latest");
        const json = await res.json();

        if (json && json.date) {
          setData((prev) => {
            const updated = [...prev, {
              time: new Date(json.date).toLocaleTimeString(),
              temperature: json.temperature,
              humidity: json.humidity,
              light: json.light,
            }];
            return updated.length > 5 ? updated.slice(-5) : updated;
          });
        }

      } catch (err) {
        console.error("❌ Lỗi fetch data:", err);
      }
    };

    // gọi API mỗi 2 giây
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // 👉 Lấy dữ liệu mới nhất
  const latestData = data.length > 0 ? data[data.length - 1] : {
    temperature: "--",
    humidity: "--",
    light: "--",
  };

  // 👉 Gửi lệnh bật/tắt thiết bị
  const toggleDevice = async (device, state) => {
    try {
      await fetch("http://localhost:5000/api/deviceactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "68bae24e9954716dfead58f7", // user mặc định
          deviceName: device,
          actions: state ? "ON" : "OFF",
        }),
      });
      console.log(`💡 ${device} -> ${state ? "ON" : "OFF"}`);
    } catch (err) {
      console.error("❌ Lỗi gửi lệnh:", err);
    }
  };

  return (
    <>
      <Layout />
      <div className="content">
        <div className="container">
          {/* Header hiển thị thông số */}
          <div className="content-header">
            <div
              className="content-temperature"
              style={{
                backgroundColor:
                  latestData.temperature < 15
                    ? "rgb(51,134,236)" // xanh dương
                    : latestData.temperature < 30
                      ? "rgb(156,201,73)" // xanh lá
                      : "rgb(237,53,53)", // đỏ
              }}
            >
              <FaTemperatureLow size={50} />
              <span>
                <h3>Temperature</h3>
                <p>{latestData.temperature}°C</p>
              </span>
            </div>

            <div
              className="content-humidity"
              style={{
                backgroundColor:
                  latestData.humidity < 40
                    ? "orange" // cam
                    : latestData.humidity < 70
                      ? "rgb(156,201,73)" // xanh lá
                      : "rgb(51,134,236)", // xanh dương
              }}
            >
              <WiHumidity size={50} />
              <span>
                <h3>Humidity</h3>
                <p>{latestData.humidity}%</p>
              </span>
            </div>

            <div
              className="content-light"
              style={{
                backgroundColor:
                  latestData.light < 100
                    ? "gray" // xám
                    : latestData.light < 500
                      ? "gold" // vàng nhạt
                      : "rgb(255,215,0)", // vàng đậm
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
          <div className="content-main container mt-3">
            <div className="row">
              {/* Biểu đồ */}
              <div className="col-9">
                <ResponsiveContainer width="100%" height={550}>
                  <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <Line type="monotone" dataKey="temperature" stroke="#ff7300" name="Temperature (°C)" />
                    <Line type="monotone" dataKey="humidity" stroke="#387908" name="Humidity (%)" />
                    <Line type="monotone" dataKey="light" stroke="#8884d8" name="Light (lx)" />
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
                <div className="control-fan mb-3">
                  <FaFan className={`icon ${fanOn ? "spin" : ""}`} />
                  <span> Quạt </span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={fanOn}
                      onChange={() => {
                        setFanOn(!fanOn);
                        toggleDevice("quat", !fanOn);
                      }}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                {/* Điều hòa */}
                <div className="control-air mb-3">
                  <span className="me-2">
                    {acOn ? <TbAirConditioning size={55} /> : <TbAirConditioningDisabled size={55} />}
                  </span>
                  <span>Điều hòa</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={acOn}
                      onChange={() => {
                        setAcOn(!acOn);
                        toggleDevice("dieuhoa", !acOn);
                      }}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                {/* Đèn */}
                <div className="control-light mb-3">
                  <FaLightbulb className={`icon ${lightOn ? "led-on" : ""}`} />
                  <span>Đèn</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={lightOn}
                      onChange={() => {
                        setLightOn(!lightOn);
                        toggleDevice("den", !lightOn);
                      }}
                    />
                    <span className="slider round"></span>
                  </label>
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
