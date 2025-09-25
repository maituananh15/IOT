import React from 'react';
import { NavLink } from 'react-router-dom';
import { TbCloudComputing } from "react-icons/tb";
import { MdDashboard, MdDataExploration, MdManageHistory } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import logo from '../images/goc.jpg';
import './layout.css';

const Layout = () => {
  return (
    <div className='header'>
      <div className='header-content'>
        <div className='logo'>
          <TbCloudComputing size={50} />
          <h1>IoT</h1>
        </div>
        <div className='menu'>
          <ul>
            <li>
              <NavLink 
                to="/home" 
                className={({ isActive }) => isActive ? "active" : ""}
              >
                <MdDashboard size={30} />
                <span>Home</span>
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/data" 
                className={({ isActive }) => isActive ? "active" : ""}
              >
                <MdDataExploration size={30} />
                <span>DATA SENSOR</span>
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/history" 
                className={({ isActive }) => isActive ? "active" : ""}
              >
                <MdManageHistory size={30} />
                <span>DEVICE ACTIVITY</span>
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/profile" 
                className={({ isActive }) => isActive ? "active" : ""}
              >
                <CgProfile size={30} />
                <span>MY PROFILE</span>
              </NavLink>
            </li>
          </ul>
        </div>
        <div className='user-info'>
          <span>Mai Tuấn Anh</span>
          <img 
            src={logo} 
            alt="Logo" 
            style={{ width: '50px', height: '50px', borderRadius: '60px' }} 
          />
        </div>
      </div>
    </div>
  )
}

export default Layout;
