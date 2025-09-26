import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../Layouts/layout';
import './MyProfile.css';
import Logo from '../images/goc.jpg';

const MyProfile = () => {
  const [data, setData] = useState([]);   // dữ liệu từ BE

  const fetchData = async () => {
    let url = "http://localhost:5000/api/users";
    const res = await fetch(url);
    const result = await res.json();
    setData(result);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Layout />
      <div className='container my-5'>
        <div className='profile-card'>
          <div className='row'>
            {data.map((user) => (
              <React.Fragment key={user.id}>
                <div className='col-md-5 profile-header mt-4'>
                  <img src={Logo} alt="Profile" style={{ width: '200px', height: '200px' }} />
                  <h2 className='text-center mt-3'>{user.name}</h2>
                  <p className='text-center'>Student at PTIT University</p>
                </div>
                <div className='col-md-7 profile-info'>
                  <h3>Thông tin cá nhân</h3>
                  <strong>Mã SV: {user.maSv}</strong>
                  <strong>Lớp: {user.class}</strong>
                  <strong>Que Quan: {user.address}</strong>
                  <strong>
                    <Link to={user.linkGithub} target="_blank">
                      <span>Link Github: {user.linkGithub}</span>
                    </Link>
                  </strong>
                  <strong>
                    <Link to={user.linkPDF} target="_blank">
                      <span>Link PDF: {user.linkPDF}</span>
                    </Link>
                  </strong>
                  <strong>
                    <a
                      href="https://basanphu92-3116187.postman.co/workspace/B%C3%A0-S%C4%83n-Ph%C3%BA's-Workspace~893a5ac6-36b9-4c6f-8074-ab3e5119c58b/collection/48788393-8bfeafb8-605e-41c7-8805-45e1c59a6147?action=share&creator=48788393"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>API : POSTMAN</span>
                    </a>
                  </strong>

                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MyProfile;
