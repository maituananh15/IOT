// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import các page
import Home from './Home/home.jsx';
import MyProfile from './MyProfile/MyProfile.jsx';
import DataSensor from './DataSensor/DataSensor.jsx';
import DeviceActivity from './DeviceActivity/DeviceActivity.jsx';


function App() {
  return (
    <Router>
      <div>
        {/* Các route */}
        <Routes>
          {/* Khi vào "/" thì chuyển sang /home */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />

          <Route path="/profile" element={<MyProfile />} />
          <Route path="/data" element={<DataSensor />} />
          <Route path="/history" element={<DeviceActivity />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;

