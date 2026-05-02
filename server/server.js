const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Mock data - Điểm tốt nghiệp
const mockData = {
  khoaHoc: [
    { maKhoa: 'K20', tenKhoa: 'Khóa 2020 - 2024' },
    { maKhoa: 'K21', tenKhoa: 'Khóa 2021 - 2025' },
    { maKhoa: 'K22', tenKhoa: 'Khóa 2022 - 2026' }
  ],
  nganhHoc: [
    { maNganh: 'CNTT', tenNganh: 'Công nghệ thông tin' },
    { maNganh: 'KHMT', tenNganh: 'Khoa học máy tính' },
    { maNganh: 'ATTT', tenNganh: 'An toàn thông tin' },
    { maNganh: 'TKDH', tenNganh: 'Thiết kế hóa học' },
    { maNganh: 'QTKD', tenNganh: 'Quản trị kinh doanh' }
  ],
  sinhVien: [
    { maSV: 'SV001', hoDem: 'Nguyễn Văn', ten: 'An', maKhoa: 'K20', maNganh: 'CNTT', diemTB: 8.5, xepLoai: 'Giỏi', trangThai: 'Tốt nghiệp' },
    { maSV: 'SV002', hoDem: 'Trần Thị', ten: 'Bình', maKhoa: 'K20', maNganh: 'CNTT', diemTB: 7.8, xepLoai: 'Khá', trangThai: 'Tốt nghiệp' },
    { maSV: 'SV003', hoDem: 'Lê Hoàng', ten: 'Nam', maKhoa: 'K20', maNganh: 'KHMT', diemTB: 9.0, xepLoai: 'Xuất sắc', trangThai: 'Tốt nghiệp' },
    { maSV: 'SV004', hoDem: 'Phạm Thị', ten: 'Hương', maKhoa: 'K20', maNganh: 'ATTT', diemTB: 8.2, xepLoai: 'Giỏi', trangThai: 'Tốt nghiệp' },
    { maSV: 'SV005', hoDem: 'Hoàng Văn', ten: 'Tuấn', maKhoa: 'K21', maNganh: 'CNTT', diemTB: 6.5, xepLoai: 'Trung bình', trangThai: 'Tốt nghiệp' },
    { maSV: 'SV006', hoDem: 'Đỗ Thị', ten: 'Mai', maKhoa: 'K21', maNganh: 'TKDH', diemTB: 7.2, xepLoai: 'Khá', trangThai: 'Tốt nghiệp' },
    { maSV: 'SV007', hoDem: 'Bùi Văn', ten: 'Hùng', maKhoa: 'K21', maNganh: 'QTKD', diemTB: 8.0, xepLoai: 'Giỏi', trangThai: 'Tốt nghiệp' },
    { maSV: 'SV008', hoDem: 'Vũ Thị', ten: 'Lan', maKhoa: 'K22', maNganh: 'KHMT', diemTB: 8.8, xepLoai: 'Giỏi', trangThai: 'Chưa tốt nghiệp' },
    { maSV: 'SV009', hoDem: 'Đinh Văn', ten: 'Minh', maKhoa: 'K22', maNganh: 'ATTT', diemTB: 7.5, xepLoai: 'Khá', trangThai: 'Chưa tốt nghiệp' },
    { maSV: 'SV010', hoDem: 'Ngô Thị', ten: 'Hoa', maKhoa: 'K22', maNganh: 'CNTT', diemTB: 9.2, xepLoai: 'Xuất sắc', trangThai: 'Chưa tốt nghiệp' }
  ]
};

// API: Lấy danh sách khóa học
app.get('/api/khoa-hoc', (req, res) => {
  res.json(mockData.khoaHoc);
});

// API: Lấy danh sách ngành học
app.get('/api/nganh-hoc', (req, res) => {
  res.json(mockData.nganhHoc);
});

// API: Báo cáo tổng hợp điểm tốt nghiệp
app.get('/api/bao-cao/diem-tot-nghiep', (req, res) => {
  const { khoaHoc, nganhHoc, trangThai } = req.query;
  
  let filteredData = [...mockData.sinhVien];
  
  if (khoaHoc && khoaHoc !== 'all') {
    filteredData = filteredData.filter(sv => sv.maKhoa === khoaHoc);
  }
  
  if (nganhHoc && nganhHoc !== 'all') {
    filteredData = filteredData.filter(sv => sv.maNganh === nganhHoc);
  }
  
  if (trangThai && trangThai !== 'all') {
    filteredData = filteredData.filter(sv => sv.trangThai === trangThai);
  }
  
  // Tính toán thống kê
  const thongKe = {
    tongSo: filteredData.length,
    daTotNghiep: filteredData.filter(sv => sv.trangThai === 'Tốt nghiệp').length,
    chuaTotNghiep: filteredData.filter(sv => sv.trangThai === 'Chưa tốt nghiệp').length,
    diemTBChung: filteredData.length > 0 
      ? (filteredData.reduce((sum, sv) => sum + sv.diemTB, 0) / filteredData.length).toFixed(2)
      : 0,
    xepLoai: {
      xuatSac: filteredData.filter(sv => sv.xepLoai === 'Xuất sắc').length,
      gioi: filteredData.filter(sv => sv.xepLoai === 'Giỏi').length,
      kha: filteredData.filter(sv => sv.xepLoai === 'Khá').length,
      trungBinh: filteredData.filter(sv => sv.xepLoai === 'Trung bình').length
    }
  };
  
  res.json({
    success: true,
    data: filteredData,
    thongKe: thongKe
  });
});

// API: Chi tiết sinh viên
app.get('/api/sinh-vien/:maSV', (req, res) => {
  const { maSV } = req.params;
  const sinhVien = mockData.sinhVien.find(sv => sv.maSV === maSV);
  
  if (sinhVien) {
    res.json({ success: true, data: sinhVien });
  } else {
    res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên' });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
