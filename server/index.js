const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = '28112006';

// 1. Kết nối MySQL bằng Pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '28112006a@B',
  database: 'my_app_db',
  waitForConnections: true,
  connectionLimit: 100
});

// Hàm tạo ID tùy chỉnh
async function generateCustomId(rolePrefix) {
  // 1. Tìm ID lớn nhất hiện có của loại user đó
  // Ví dụ: Tìm SV-% để lấy SV-000005
  const [rows] = await db.query(
    "SELECT id FROM users WHERE id LIKE ? ORDER BY id DESC LIMIT 1",
    [`${rolePrefix}-%`]
  );

  let nextNumber = 1;

  if (rows.length > 0) {
    // Lấy phần số sau dấu gạch ngang (VD: SV-000005 -> 000005)
    const lastId = rows[0].id;
    const lastNumber = parseInt(lastId.split("-")[1]);
    nextNumber = lastNumber + 1;
  }

  // 2. Định dạng lại chuỗi số
  // Admin (AD) dùng 2 chữ số, SV và GV dùng 6 chữ số
  if (rolePrefix === "AD") {
    return `AD-${nextNumber.toString().padStart(2, '0')}`;
  } else {
    return `${rolePrefix}-${nextNumber.toString().padStart(6, '0')}`;
  }
}

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

// --- API ROUTES ---

// 1. API Lấy danh sách users (CẦN THIẾT cho trang Quản lý)
app.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, created_at, status, role_id, university FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. API Đăng nhập
app.post('/login', async (req, res) => {
  console.log(">>> Nhận yêu cầu đăng nhập:", req.body);
  try {
    const { email, password } = req.body;
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) return res.status(401).json({ error: "Email không tồn tại" });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Mật khẩu không chính xác" });

    if (user.status !== 'active') return res.status(403).json({ error: "Tài khoản chưa được kích hoạt" });

    const token = jwt.sign({ id: user.id, role: user.role_id }, JWT_SECRET, { expiresIn: '1d' });

    return res.json({
      message: "Đăng nhập thành công!",
      token,
      user: { id: user.id, name: user.name, role_id: user.role_id }
    });
  } catch (err) {
    res.status(500).json({ error: "Lỗi kết nối cơ sở dữ liệu" });
  }
});

// 3. API Admin thêm user thủ công (Đã gộp và sửa lỗi)
app.post('/users', async (req, res) => {
  const { name, email, password, role_id, university } = req.body;
  try {
    const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) return res.status(400).json({ error: "Email này đã tồn tại!" });

    let prefix = "SV";
    if (role_id == 1) prefix = "AD";
    else if (role_id == 2) prefix = "GV";

    const customId = await generateCustomId(prefix);
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (id, name, email, password, role_id, status, university) VALUES (?, ?, ?, ?, ?, ?, ?)';
    await db.query(sql, [customId, name, email, hashedPassword, role_id, 'active', university]);

    res.status(201).json({ message: "Thêm người dùng mới thành công!", id: customId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. API Đăng ký tài khoản
app.post('/register', async (req, res) => {
  const { name, email, password, role, university } = req.body;
  try {
    const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) return res.status(400).json({ error: "Email này đã được sử dụng!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const isLecturerRole = (role === 'lecture' || role === 'lecturer');
    const prefix = isLecturerRole ? "GV" : "SV";
    const role_id = isLecturerRole ? 2 : 3;
    const status = isLecturerRole ? 'inactive' : 'active';

    const customId = await generateCustomId(prefix);
    const sql = 'INSERT INTO users (id, name, email, password, role_id, status, university) VALUES (?, ?, ?, ?, ?, ?, ?)';
    await db.query(sql, [customId, name, email, hashedPassword, role_id, status, university]);

    res.status(201).json({ message: "Đăng ký thành công!", id: customId, status });

    // Gửi mail thông báo
    let mailContent = isLecturerRole ? "Tài khoản Giảng viên đang chờ Admin phê duyệt." : "Tài khoản Sinh viên đã được kích hoạt.";
    transporter.sendMail({
      from: '"BrainlyX" <lmsbrainlyx@gmail.com>',
      to: email,
      subject: 'Thông báo đăng ký tài khoản',
      html: emailTemplate(name, mailContent, "Truy cập hệ thống", "http://localhost:5173")
    }).catch(err => console.error("Lỗi gửi mail:", err.message));

  } catch (err) {
    res.status(500).json({ error: "Lỗi hệ thống khi đăng ký" });
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

// index.js
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, university, status } = req.body;
    try {
        const sql = 'UPDATE users SET name = ?, university = ?, status = ? WHERE id = ?';
        const [result] = await db.query(sql, [name, university, status, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Không tìm thấy người dùng" });
        }
        res.json({ message: "Cập nhật thành công!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Cập nhật thông tin khóa học
app.put('/api/courses/:id', async (req, res) => {
    const { id } = req.params;
    const { course_name, course_code, description } = req.body;
    
    try {
        const sql = `
            UPDATE courses 
            SET course_name = ?, course_code = ?, description = ? 
            WHERE id = ?
        `;
        const [result] = await db.query(sql, [course_name, course_code, description, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Không tìm thấy khóa học để cập nhật" });
        }

        res.json({ success: true, message: "Cập nhật khóa học thành công!" });
    } catch (err) {
        console.error("Lỗi cập nhật:", err);
        res.status(500).json({ error: "Lỗi hệ thống khi cập nhật" });
    }
});

// Lấy danh sách khóa học theo ID giảng viên
app.get('/api/courses/:lecturerId', async (req, res) => {
    const { lecturerId } = req.params;
    try {
        const [rows] = await db.query(
            "SELECT * FROM courses WHERE lecturer_id = ?", 
            [lecturerId]
        );
        
        // Nếu không có khóa học nào, trả về mảng rỗng [] thay vì lỗi 404
        res.json(rows); 
    } catch (err) {
        console.error("Lỗi MySQL:", err);
        res.status(500).json({ error: "Lỗi kết nối cơ sở dữ liệu" });
    }
});

// API Tạo khóa học mới
app.post('/api/courses', async (req, res) => {
    const { course_name, course_code, description, lecturer_id } = req.body;
    
    try {
        const sql = `
            INSERT INTO courses (course_name, course_code, description, lecturer_id, delete_status) 
            VALUES (?, ?, ?, ?, 'none')
        `;
        const [result] = await db.query(sql, [course_name, course_code, description, lecturer_id]);
        
        res.status(201).json({ 
            success: true, 
            message: "Tạo khóa học thành công!",
            courseId: result.insertId 
        });
    } catch (err) {
        console.error("Lỗi tạo khóa học:", err);
        res.status(500).json({ error: "Lỗi hệ thống khi tạo khóa học" });
    }
});

// API gửi yêu cầu xóa
app.post('/api/courses/request-delete', async (req, res) => {
    const { id } = req.body;
    try {
        // Thay vì xóa luôn, ta cập nhật trạng thái thành 'pending'
        await db.query("UPDATE courses SET delete_status = 'pending' WHERE id = ?", [id]);
        res.json({ success: true, message: "Yêu cầu xóa đã được gửi" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin duyệt xóa (Sử dụng ở trang Admin)
app.delete('/api/admin/courses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM courses WHERE id = ?", [id]);
        res.json({ success: true, message: "Đã xóa khóa học vĩnh viễn" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 1. Lấy danh sách các khóa học đang chờ xóa
app.get('/api/admin/course-requests', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT c.*, u.name as lecturer_name 
             FROM courses c 
             JOIN users u ON c.lecturer_id = u.id 
             WHERE c.delete_status = 'pending'`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Xử lý yêu cầu (Duyệt xóa hoặc Hủy yêu cầu xóa)
app.post('/api/admin/course-process', async (req, res) => {
    const { id, action } = req.body; // action: 'approve' hoặc 'reject'
    try {
        if (action === 'approve') {
            await db.query("DELETE FROM courses WHERE id = ?", [id]);
            res.json({ message: "Đã xóa khóa học vĩnh viễn" });
        } else {
            await db.query("UPDATE courses SET delete_status = 'none' WHERE id = ?", [id]);
            res.json({ message: "Đã từ chối yêu cầu xóa" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Mỗi IP chỉ được thử đăng nhập sai 5 lần trong 15 phút
  message: "Quá nhiều lần thử, vui lòng quay lại sau."
});

app.use('/login', loginLimiter);

app.listen(5000, () => console.log('🚀 Server chạy tại http://localhost:5000'));