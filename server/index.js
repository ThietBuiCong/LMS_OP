const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); // Cho phép Frontend truy cập
app.use(express.json());

// Kết nối MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '28112006a@B', // Mật khẩu bạn đã đặt
  database: 'my_app_db'
});

db.connect((err) => {
  if (err) throw err;
  console.log('✅ Đã kết nối MySQL thành công!');
});

// API lấy danh sách users

// API lấy danh sách users (JOIN với bảng roles)
app.get('/users', (req, res) => {
  // Lấy thêm role_id (hoặc JOIN để lấy role_name nếu bạn đã tạo bảng roles)
  const sql = 'SELECT id, name, email, created_at, status, role_id, university FROM users';
  
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Lỗi MySQL:", err.sqlMessage);
      return res.status(500).json({ error: err.sqlMessage });
    }
    res.json(result); 
  });
});

// Cập nhật API POST để nhận thêm role_id (tùy chọn)
app.post('/users', (req, res) => {
    const { name, email, password, role_id, university } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    // Chuyển role_id sang chuỗi vì DB của bạn đang để varchar(100)
    const finalRoleId = role_id ? String(role_id) : "3";

    const sql = 'INSERT INTO users (name, email, password, role_id, university) VALUES (?, ?, ?, ?, ?)';

    db.query(sql, [name, email, password, finalRoleId, university], (err, result) => {
        if (err) {
            // QUAN TRỌNG: Hãy nhìn vào Terminal chạy Node.js để xem dòng này
            console.error("LỖI THỰC TẾ TẠI MYSQL:", err.sqlMessage); 
            return res.status(500).json({ error: err.sqlMessage });
        }
        res.status(201).json({ message: "Thêm thành công!", id: result.insertId });
    });
});

app.post('/register', (req, res) => {
    const { name, email, password, role, university } = req.body;

    // Quy đổi role từ string sang ID
    // Giả sử: 1: Admin, 2: Lecture, 3: User
    let role_id = 3; 
    let status = 'active';

    if (role === 'lecture') { // Admin ở đây hiểu là Giảng viên theo form của bạn
        role_id = 2;
        status = 'inactive'; // Giảng viên phải chờ duyệt
    }

    const sql = 'INSERT INTO users (name, email, password, role_id, status, university) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.query(sql, [name, email, password, role_id, status, university], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "Email này đã được đăng ký!" });
            return res.status(500).json({ error: err.sqlMessage });
        }
        res.status(201).json({ message: "Đăng ký thành công!", status: status });
    });
});

// API xóa user
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM users WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Xóa người dùng thành công!" });
  });
});



app.listen(5000, () => console.log('🚀 Server chạy tại http://localhost:5000'));