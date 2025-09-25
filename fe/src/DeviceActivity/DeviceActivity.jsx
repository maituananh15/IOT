import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../Layouts/layout';
import dayjs from "dayjs";
import './DeviceActivity.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const DeviceActivity = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDevice, setFilterDevice] = useState("");
  const [filterAction, setFilterAction] = useState("");

  // pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams({
      page: currentPage,
      limit: itemsPerPage,
      search,
      filterDevice,
      filterAction,
    });
    const res = await fetch(`http://localhost:5000/api/device_actions?${params}`);
    const result = await res.json();
    setData(result.data || []);
    setTotalPages(result.totalPages || 1);
  }, [currentPage, itemsPerPage, search, filterDevice, filterAction]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Generate page numbers
  const getPageNumbers = () => {
    let pages = [];
    let maxVisible = 5;
    let start = Math.max(2, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, currentPage + Math.floor(maxVisible / 2));
    if (currentPage <= Math.floor(maxVisible / 2)) end = Math.min(totalPages - 1, maxVisible);
    if (currentPage + Math.floor(maxVisible / 2) >= totalPages) start = Math.max(2, totalPages - maxVisible + 1);

    pages.push(1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <>
      <Layout />
      <div className='container-fluid'>
        {/* Controls */}
        <div className='container-body d-flex gap-3 my-3'>
          {/* Filter Device */}
          <div className="dropdown">
            <button className="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
              Thiết bị
            </button>
            <ul className="dropdown-menu">
              <li><button className="dropdown-item" onClick={() => setFilterDevice("quat")}>Quạt</button></li>
              <li><button className="dropdown-item" onClick={() => setFilterDevice("dieuhoa")}>Điều hòa</button></li>
              <li><button className="dropdown-item" onClick={() => setFilterDevice("den")}>Đèn</button></li>
              <li><button className="dropdown-item" onClick={() => setFilterDevice("")}>Tất cả</button></li>
            </ul>
          </div>

          {/* Filter Action */}
          <div className="dropdown">
            <button className="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
              Hành động
            </button>
            <ul className="dropdown-menu">
              <li><button className="dropdown-item" onClick={() => setFilterAction("ON")}>ON</button></li>
              <li><button className="dropdown-item" onClick={() => setFilterAction("OFF")}>OFF</button></li>
              <li><button className="dropdown-item" onClick={() => setFilterAction("")}>Tất cả</button></li>
            </ul>
          </div>

          {/* Search */}
          <form
            className="d-flex gap-2 flex-grow-1"
            onSubmit={(e) => {
              e.preventDefault();
              setCurrentPage(1);
              fetchData();
            }}
          >
            <input
              style={{ width: '300px' }}
              className="form-control"
              type="text"
              placeholder="Tìm kiếm theo thời gian ...."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">Tìm</button>
          </form>
        </div>

        {/* Table */}
        <div className='container-table my-3'>
          <table className="table table-bordered text-center">
            <thead className="table-dark">
              <tr>
                <th>Stt</th>
                <th>Thiết bị</th>
                <th>Hành động</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={item._id}>
                  <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td>{item.deviceName}</td>
                  <td style={{ color: item.actions === 'ON' ? 'green' : 'red' }}>
                    {item.actions}
                  </td>
                  <td>{dayjs(item.date).format("YYYY-MM-DD HH:mm:ss")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Items per page */}
          <div className='dropdown'>
            <button className="btn btn-outline-info dropdown-toggle" data-bs-toggle="dropdown">
              Hiển thị: {itemsPerPage}
            </button>
            <ul className="dropdown-menu">
              {[10, 20, 30].map(num => (
                <li key={num}>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setItemsPerPage(num);
                      setCurrentPage(1);
                    }}
                  >
                    {num}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Pagination */}
          <div className="my-5 d-flex justify-content-center">
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>
                  Trước
                </button>
              </li>
              {getPageNumbers().map((page, i) => (
                <li
                  key={i}
                  className={`page-item ${page === currentPage ? "active" : ""} ${page === "..." ? "disabled" : ""}`}
                >
                  <button className="page-link" onClick={() => page !== "..." && setCurrentPage(page)}>
                    {page}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>
                  Sau
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeviceActivity;
