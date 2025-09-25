import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../Layouts/layout';
import dayjs from "dayjs";
import './DataSensor.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const DataSensor = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams({
      page: currentPage,
      limit: itemsPerPage,
      search,
      filterType,
      sortField,
      sortOrder
    });

    const res = await fetch(`http://localhost:5000/api/sensors?${params}`);
    const result = await res.json();
    setData(result.data || []);
    setTotalPages(result.totalPages || 1);
  }, [currentPage, itemsPerPage, search, filterType, sortField, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Generate page numbers for pagination

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

          {/* Filter */}
          <div className="dropdown">
            <button className="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
              Loại
            </button>
            <ul className="dropdown-menu">
              <li><button className="dropdown-item" onClick={() => setFilterType("temperature")}>Nhiệt độ</button></li>
              <li><button className="dropdown-item" onClick={() => setFilterType("humidity")}>Độ ẩm</button></li>
              <li><button className="dropdown-item" onClick={() => setFilterType("light")}>Ánh sáng</button></li>
              <li><button className="dropdown-item" onClick={() => setFilterType("")}>Tất cả</button></li>
            </ul>
          </div>

          {/* Sort */}
          <div className='dropdown'>
            <button className="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
              Sắp xếp
            </button>
            <ul className="dropdown-menu">
              <li><button className="dropdown-item" onClick={() => { setSortField("temperature"); setSortOrder("asc"); }}>Nhiệt độ ↑</button></li>
              <li><button className="dropdown-item" onClick={() => { setSortField("temperature"); setSortOrder("desc"); }}>Nhiệt độ ↓</button></li>
              <li><button className="dropdown-item" onClick={() => { setSortField("humidity"); setSortOrder("asc"); }}>Độ ẩm ↑</button></li>
              <li><button className="dropdown-item" onClick={() => { setSortField("humidity"); setSortOrder("desc"); }}>Độ ẩm ↓</button></li>
              <li><button className="dropdown-item" onClick={() => { setSortField("light"); setSortOrder("asc"); }}>Ánh sáng ↑</button></li>
              <li><button className="dropdown-item" onClick={() => { setSortField("light"); setSortOrder("desc"); }}>Ánh sáng ↓</button></li>
              <li><button className="dropdown-item" onClick={() => { setSortField("date"); setSortOrder("desc"); }}>Mới nhất</button></li>
              <li><button className="dropdown-item" onClick={() => { setSortField("date"); setSortOrder("asc"); }}>Cũ nhất</button></li>
            </ul>
          </div>

          {/* Search */}
          <form className="d-flex gap-2 flex-grow-1" onSubmit={(e) => {
            e.preventDefault();
            setCurrentPage(1);
            fetchData();
          }}>
            <input
              style={{ width: '300px' }}
              className="form-control"
              type="text"
              placeholder={`Nhập giá trị ${filterType || "sensor"}`}
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
                {filterType === "" && <>
                  <th>Nhiệt độ</th>
                  <th>Độ ẩm</th>
                  <th>Ánh sáng</th>
                </>}
                {filterType === "temperature" && <th>Nhiệt độ</th>}
                {filterType === "humidity" && <th>Độ ẩm</th>}
                {filterType === "light" && <th>Ánh sáng</th>}
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={item._id}>
                  <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  {filterType === "" && <>
                    <td>{item.temperature} °C</td>
                    <td>{item.humidity} %</td>
                    <td>{item.light} lux</td>
                  </>}
                  {filterType === "temperature" && <td>{item.temperature} °C</td>}
                  {filterType === "humidity" && <td>{item.humidity} %</td>}
                  {filterType === "light" && <td>{item.light} lux</td>}
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
                <li key={num}><button className="dropdown-item" onClick={() => { setItemsPerPage(num); setCurrentPage(1); }}>{num}</button></li>
              ))}
            </ul>
          </div>
          {/* Pagination */}
          <div className="my-5 d-flex justify-content-center">
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>Trước</button>
              </li>

              {getPageNumbers().map((page, i) => (
                <li key={i} className={`page-item ${page === currentPage ? "active" : ""} ${page === "..." ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => page !== "..." && setCurrentPage(page)}>{page}</button>
                </li>
              ))}

              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>Sau</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default DataSensor;
