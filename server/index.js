const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Kết nối MySQL bằng Pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '28112006a@B',
  database: 'my_app_db',
  waitForConnections: true,
  connectionLimit: 10
});

// Kiểm tra kết nối khi khởi động
db.getConnection()
  .then(() => console.log('✅ Đã kết nối MySQL thành công qua Pool!'))
  .catch(err => console.error('❌ Lỗi kết nối MySQL:', err.message));

// 2. Cấu hình Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'lmsbrainlyx@gmail.com', // Tài khoản gửi mail chính
    pass: 'xyij lbvm trgo ljwg'     // Mật khẩu ứng dụng 16 ký tự
  },
  tls: {
    rejectUnauthorized: false // Fix lỗi self-signed certificate trên máy local
  }
});

// 3. Hàm mẫu Email HTML
const emailTemplate = (name, content, buttonText, buttonUrl) => {
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <style>
        body { background: #0a0a0f; font-family: 'DM Sans', Arial, sans-serif; margin: 0; padding: 40px 16px; }
        .email-wrapper { max-width: 620px; margin: auto; background: #0a0a0f; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
        .header { padding: 40px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .logo-name { font-size: 26px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: 1px; }
        .badge-strip { background: #111118; padding: 10px 20px; text-align: center; color: rgba(255,255,255,0.4); font-size: 11px; }
        .body { background: #ffffff; padding: 40px; }
        .greeting { font-size: 22px; font-weight: 600; color: #0d0d14; margin-bottom: 10px; }
        .message { font-size: 15px; line-height: 1.75; color: #4a4a5a; }
        .highlight-box { background: #f0f7ff; border-left: 4px solid #1a8cff; padding: 15px; margin: 20px 0; border-radius: 8px; font-size: 14px; }
        .cta-btn { display: inline-block; background: linear-gradient(135deg, #1a8cff 0%, #7c4dff 100%); 
                   color: #ffffff !important; padding: 15px 40px; border-radius: 100px; text-decoration: none; font-weight: 600; }
        .footer { background: #0a0a0f; padding: 30px; color: rgba(255,255,255,0.25); text-align: center; font-size: 11px; }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <div class="logo-name">BrainlyX</div>
          <div style="color: rgba(255,255,255,0.35); font-size: 10px; text-transform: uppercase;">Learning Management System</div>
        </div>
        <div class="badge-strip">Hệ thống đang hoạt động • Thông báo bảo mật</div>
        <div class="body">
          <p class="greeting">Xin chào, ${name} 👋</p>
          <p class="message">${content}</p>
          <div class="highlight-box">
            <p style="margin:0;">📌 Lưu ý: Liên kết này có hiệu lực trong vòng 24 giờ kể từ khi được gửi.</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${buttonUrl}" class="cta-btn">${buttonText}</a>
          </div>
        </div>
        <div class="footer">
          © 2026 BrainlyX University. All rights reserved.<br/>
          TP. Hồ Chí Minh, Việt Nam
        </div>
      </div>
    </body>
    </html>
  `;
};

// --- API ROUTES ---

// API lấy danh sách users
app.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, created_at, status, role_id, university FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Thêm user thủ công (Dùng cho Admin nhập liệu)
app.post('/users', async (req, res) => {
  const { name, email, password, role_id, university } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
  }
  const finalRoleId = role_id ? String(role_id) : "3";
  try {
    const sql = 'INSERT INTO users (name, email, password, role_id, university) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.query(sql, [name, email, password, finalRoleId, university]);
    res.status(201).json({ message: "Thêm thành công!", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Đăng ký tài khoản (Phân loại Lecturer/Student)
app.post('/register', async (req, res) => {
  const { name, email, password, role, university } = req.body;

  const isLecturerRole = (role === 'lecture' || role === 'lecturer');
  const role_id = isLecturerRole ? 2 : 3;
  const status = isLecturerRole ? 'inactive' : 'active';

  let mailContent = isLecturerRole
    ? "Tài khoản Giảng viên của bạn đã được khởi tạo và đang chờ Admin phê duyệt. Vui lòng đợi thông báo tiếp theo từ hệ thống."
    : "Chúc mừng! Tài khoản Sinh viên của bạn đã được kích hoạt thành công. Bạn có thể bắt đầu khám phá các khóa học ngay bây giờ.";

  let btnText = isLecturerRole ? "Xem trạng thái" : "Bắt đầu ngay";
  let btnUrl = "http://localhost:5173"; // Link dẫn về trang chủ/login của bạn

  try {
    const sql = 'INSERT INTO users (name, email, password, role_id, status, university) VALUES (?, ?, ?, ?, ?, ?)';
    await db.query(sql, [name, email, password, role_id, status, university]);

    res.status(201).json({ message: "Đăng ký thành công!", status: status });

    // Gửi mail ngầm với giao diện HTML đẹp
    transporter.sendMail({
      from: '"Hệ Thống LMS BrainlyX" <lmsbrainlyx@gmail.com>',
      to: email,
      subject: isLecturerRole ? 'Xác nhận đăng ký Giảng viên' : 'Đăng ký thành công',
      html: emailTemplate(name, mailContent, btnText, btnUrl)
    }).then(() => console.log(`--- Đã gửi mail thành công tới: ${email}`))
      .catch(err => console.error("--- Lỗi gửi mail:", err.message));

  } catch (err) {
    console.error("Lỗi tại Route Register:", err);
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "Email đã tồn tại!" });
    res.status(500).json({ error: err.message });
  }
});

// API CHẤP NHẬN (Approve)
app.post('/api/users/approve', async (req, res) => {
  const { id } = req.body;
  try {
    const [users] = await db.query("SELECT email, name FROM users WHERE id = ?", [id]);
    if (users.length === 0) return res.status(404).json({ error: "User không tồn tại" });

    await db.query("UPDATE users SET status = 'active' WHERE id = ?", [id]);

    await transporter.sendMail({
      from: '"Hệ Thống LMS BrainlyX" <lmsbrainlyx@gmail.com>',
      to: users[0].email,
      subject: 'Tài khoản Giảng viên đã được kích hoạt',
      html: emailTemplate(users[0].name, "Tài khoản giảng viên của bạn đã được phê duyệt. Bạn có thể đăng nhập vào hệ thống ngay bây giờ.", "Đăng nhập ngay", "http://localhost:5173/login")
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API TỪ CHỐI (Reject)
app.post('/api/users/reject', async (req, res) => {
  const { id } = req.body;
  try {
    const [users] = await db.query("SELECT email, name FROM users WHERE id = ?", [id]);
    if (users.length === 0) return res.status(404).json({ error: "User không tồn tại" });

    await transporter.sendMail({
      from: '"Hệ Thống LMS BrainlyX" <lmsbrainlyx@gmail.com>',
      to: users[0].email,
      subject: 'Thông báo kết quả đăng ký tài khoản',
      html: emailTemplate(users[0].name, "Yêu cầu đăng ký của bạn đã bị từ chối. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.", "Liên hệ hỗ trợ", "mailto:lmsbrainlyx@gmail.com")
    });

    await db.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API Xóa user
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: "Xóa người dùng thành công!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('🚀 Server chạy tại http://localhost:5000'));