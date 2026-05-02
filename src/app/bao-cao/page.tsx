'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Script from 'next/script'

interface ThongKe {
  tongSo: number
  daTotNghiep: number
  chuaTotNghiep: number
  diemTBChung: string
  xepLoai: { xuatSac: number; gioi: number; kha: number; trungBinh: number }
}

interface SinhVien {
  maSV: string; hoDem: string; ten: string; maKhoa: string; maNganh: string
  diemTB: number; xepLoai: string; trangThai: string
}

const API_URL = 'http://localhost:3000/api'

declare global {
  interface Window { Chart?: any }
}

export default function BaoCaoPage() {
  const [khoaList, setKhoaList] = useState<{ maKhoa: string; tenKhoa: string }[]>([])
  const [nganhList, setNganhList] = useState<{ maNganh: string; tenNganh: string }[]>([])
  const [khoaHoc, setKhoaHoc] = useState('all')
  const [nganhHoc, setNganhHoc] = useState('all')
  const [trangThai, setTrangThai] = useState('all')
  const [currentData, setCurrentData] = useState<SinhVien[]>([])
  const [filteredData, setFilteredData] = useState<SinhVien[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [thongKe, setThongKe] = useState<ThongKe | null>(null)
  const [showData, setShowData] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [chartLoaded, setChartLoaded] = useState(false)
  
  const rankChartRef = useRef<HTMLCanvasElement>(null)
  const statusChartRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => { loadFilters() }, [])

  useEffect(() => {
    if (thongKe && chartLoaded) { renderCharts() }
  }, [thongKe, chartLoaded])

  async function loadFilters() {
    try {
      const [khoaRes, nganhRes] = await Promise.all([
        fetch(`${API_URL}/khoa-hoc`), fetch(`${API_URL}/nganh-hoc`)
      ])
      setKhoaList(await khoaRes.json())
      setNganhList(await nganhRes.json())
    } catch (error) { console.error('Lỗi khi tải bộ lọc:', error) }
  }

  async function loadReport() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (khoaHoc !== 'all') params.append('khoaHoc', khoaHoc)
      if (nganhHoc !== 'all') params.append('nganhHoc', nganhHoc)
      if (trangThai !== 'all') params.append('trangThai', trangThai)
      
      const response = await fetch(`${API_URL}/bao-cao/diem-tot-nghiep?${params}`)
      const result = await response.json()
      
      if (result.success && result.data.length > 0) {
        setCurrentData(result.data)
        setFilteredData(result.data)
        setThongKe(result.thongKe)
        setCurrentPage(1)
        setShowData(true)
      } else { setShowData(false) }
    } catch (error) { console.error('Lỗi khi tải báo cáo:', error) }
    finally { setLoading(false) }
  }

  const renderCharts = useCallback(() => {
    if (!rankChartRef.current || !statusChartRef.current || !thongKe || !window.Chart) return

    const Chart = window.Chart
    const rankCtx = rankChartRef.current.getContext('2d')
    const statusCtx = statusChartRef.current.getContext('2d')

    if (!rankCtx || !statusCtx) return

    new Chart(rankCtx, {
      type: 'doughnut',
      data: {
        labels: ['Xuất sắc', 'Giỏi', 'Khá', 'Trung bình'],
        datasets: [{ data: [thongKe.xepLoai.xuatSac, thongKe.xepLoai.gioi, thongKe.xepLoai.kha, thongKe.xepLoai.trungBinh], backgroundColor: ['#11998e', '#667eea', '#f59e0b', '#ef4444'], borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '65%' }
    })

    new Chart(statusCtx, {
      type: 'pie',
      data: {
        labels: ['Đã tốt nghiệp', 'Chưa tốt nghiệp'],
        datasets: [{ data: [thongKe.daTotNghiep, thongKe.chuaTotNghiep], backgroundColor: ['#11998e', '#f59e0b'], borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    })
  }, [thongKe])

  function handleSearch(term: string) {
    setSearchTerm(term)
    setFilteredData(currentData.filter(sv => 
      sv.maSV.toLowerCase().includes(term.toLowerCase()) ||
      sv.hoDem.toLowerCase().includes(term.toLowerCase()) ||
      sv.ten.toLowerCase().includes(term.toLowerCase())
    ))
    setCurrentPage(1)
  }

  function getBadgeClass(xepLoai: string) {
    switch(xepLoai) { case 'Xuất sắc': return 'badge-xuat-sac'; case 'Giỏi': return 'badge-gioi'; case 'Khá': return 'badge-kha'; case 'Trung bình': return 'badge-trung-binh'; default: return '' }
  }

  function exportExcel() {
    if (filteredData.length === 0) return
    let csv = '\uFEFFSTT,Mã SV,Họ tên,Khóa,Ngành,Điểm TB,Xếp loại,Trạng thái\n'
    filteredData.forEach((sv, index) => { csv += `${index + 1},${sv.maSV},"${sv.hoDem} ${sv.ten}",${sv.maKhoa},${sv.maNganh},${sv.diemTB},"${sv.xepLoai}","${sv.trangThai}"\n` })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `BaoCao_DiemTotNghiep_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const itemsPerPage = 10
  const start = (currentPage - 1) * itemsPerPage
  const end = start + itemsPerPage
  const pageData = filteredData.slice(start, end)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="lazyOnload" onLoad={() => setChartLoaded(true)} />
      <div className="glass-card">
      {/* Header */}
      <div className="header-section">
        <div className="header-content">
          <h1><i className="fas fa-graduation-cap me-3"></i>Báo cáo tổng hợp điểm tốt nghiệp</h1>
          <p>Hệ thống quản lý trường học - HOM7 | Theo dõi và thống kê kết quả học tập sinh viên</p>
        </div>
        <i className="fas fa-chart-bar header-icon"></i>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="row g-4">
          <div className="col-lg-3 col-md-6">
            <div className="filter-group">
              <label><i className="fas fa-calendar-alt me-2"></i>Khóa học</label>
              <select className="form-select" value={khoaHoc} onChange={(e) => setKhoaHoc(e.target.value)}>
                <option value="all">Tất cả khóa học</option>
                {khoaList.map(khoa => (
                  <option key={khoa.maKhoa} value={khoa.maKhoa}>{khoa.tenKhoa}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="filter-group">
              <label><i className="fas fa-book me-2"></i>Ngành học</label>
              <select className="form-select" value={nganhHoc} onChange={(e) => setNganhHoc(e.target.value)}>
                <option value="all">Tất cả ngành</option>
                {nganhList.map(nganh => (
                  <option key={nganh.maNganh} value={nganh.maNganh}>{nganh.maNganh} - {nganh.tenNganh}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="filter-group">
              <label><i className="fas fa-info-circle me-2"></i>Trạng thái</label>
              <select className="form-select" value={trangThai} onChange={(e) => setTrangThai(e.target.value)}>
                <option value="all">Tất cả</option>
                <option value="Tốt nghiệp">Đã tốt nghiệp</option>
                <option value="Chưa tốt nghiệp">Chưa tốt nghiệp</option>
              </select>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 d-flex align-items-end">
            <button className="btn btn-primary-gradient w-100" onClick={loadReport} disabled={loading}>
              <i className="fas fa-search me-2"></i>{loading ? 'Đang tải...' : 'Xem báo cáo'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {showData && thongKe && (
        <>
          <div className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon blue"><i className="fas fa-users"></i></div>
                <div className="stat-value">{thongKe.tongSo}</div>
                <div className="stat-label">Tổng sinh viên</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green"><i className="fas fa-graduation-cap"></i></div>
                <div className="stat-value">{thongKe.daTotNghiep}</div>
                <div className="stat-label">Đã tốt nghiệp</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon pink"><i className="fas fa-clock"></i></div>
                <div className="stat-value">{thongKe.chuaTotNghiep}</div>
                <div className="stat-label">Chưa tốt nghiệp</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon cyan"><i className="fas fa-chart-line"></i></div>
                <div className="stat-value">{thongKe.diemTBChung}</div>
                <div className="stat-label">Điểm TB chung</div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-header">
                  <h5 className="chart-title"><i className="fas fa-chart-pie me-2"></i>Phân bố xếp loại</h5>
                </div>
                <div className="chart-container">
                  <canvas ref={rankChartRef}></canvas>
                </div>
                <div className="rank-legend">
                  <div className="rank-item"><span className="rank-dot" style={{background: '#11998e'}}></span><span>Xuất sắc: {thongKe.xepLoai.xuatSac}</span></div>
                  <div className="rank-item"><span className="rank-dot" style={{background: '#667eea'}}></span><span>Giỏi: {thongKe.xepLoai.gioi}</span></div>
                  <div className="rank-item"><span className="rank-dot" style={{background: '#f59e0b'}}></span><span>Khá: {thongKe.xepLoai.kha}</span></div>
                  <div className="rank-item"><span className="rank-dot" style={{background: '#ef4444'}}></span><span>Trung bình: {thongKe.xepLoai.trungBinh}</span></div>
                </div>
              </div>
              <div className="chart-card">
                <div className="chart-header">
                  <h5 className="chart-title"><i className="fas fa-chart-doughnut me-2"></i>Tỷ lệ tốt nghiệp</h5>
                </div>
                <div className="chart-container">
                  <canvas ref={statusChartRef}></canvas>
                </div>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="search-section">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input type="text" className="form-control" placeholder="Tìm kiếm theo tên, mã sinh viên..." onChange={(e) => handleSearch(e.target.value)} />
            </div>
          </div>

          {/* Table Section */}
          <div className="table-section">
            <div className="table-header">
              <h5 className="table-title"><i className="fas fa-list"></i>Danh sách sinh viên</h5>
              <div className="table-actions">
                <button className="btn btn-success-gradient" onClick={exportExcel}>
                  <i className="fas fa-file-excel me-2"></i>Xuất Excel
                </button>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Sinh viên</th>
                    <th>Khóa</th>
                    <th>Ngành</th>
                    <th>Điểm TB</th>
                    <th>Xếp loại</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((sv, index) => (
                    <tr key={sv.maSV}>
                      <td><strong>{start + index + 1}</strong></td>
                      <td>
                        <div className="student-info">
                          <div className="student-avatar">{sv.hoDem.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                          <div>
                            <div className="student-name">{sv.hoDem} {sv.ten}</div>
                            <div className="student-id">{sv.maSV}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge bg-light text-dark">{sv.maKhoa}</span></td>
                      <td>{sv.maNganh}</td>
                      <td><span className="score-highlight">{sv.diemTB.toFixed(1)}</span></td>
                      <td><span className={`badge badge-custom ${getBadgeClass(sv.xepLoai)}`}>{sv.xepLoai}</span></td>
                      <td><span className={sv.trangThai === 'Tốt nghiệp' ? 'status-tot-nghiep' : 'status-chua-tot-nghiep'}>{sv.trangThai}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination-section">
              <div className="pagination-info">
                Hiển thị {start + 1}-{Math.min(end, filteredData.length)} của {filteredData.length} sinh viên
              </div>
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => p - 1)}><i className="fas fa-chevron-left"></i></button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => p + 1)}><i className="fas fa-chevron-right"></i></button>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!showData && !loading && (
        <div className="empty-state">
          <div className="empty-icon"><i className="fas fa-inbox"></i></div>
          <h3 className="empty-title">Không tìm thấy dữ liệu báo cáo</h3>
          <p className="empty-text">Vui lòng chọn điều kiện lọc và nhấn "Xem báo cáo" để hiển thị dữ liệu sinh viên</p>
        </div>
      )}
      </div>
    </>
  )
}
