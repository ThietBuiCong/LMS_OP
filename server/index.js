const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');         // FIX: Thêm thư viện quản lý file vật lý
const path = require('path');     // FIX: Thêm thư viện path
const rateLimit = require('express-rate-limit'); // FIX: Thêm thư viện chặn brute-force

const app = express();
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const JWT_SECRET = '28112006';
const PORT = process.env.PORT || 5000;

// 1. Kết nối MySQL bằng Pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: 'root',
  password: '28112006a@B',
  database: 'my_app_db',
  waitForConnections: true,
  connectionLimit: 100
});

// Hàm tạo ID tùy chỉnh
async function generateCustomId(rolePrefix) {
  const [rows] = await db.query(
    "SELECT id FROM users WHERE id LIKE ? ORDER BY id DESC LIMIT 1",
    [`${rolePrefix}-%`]
  );

  let nextNumber = 1;
  if (rows.length > 0) {
    const lastId = rows[0].id;
    const lastNumber = parseInt(lastId.split("-")[1]);
    nextNumber = lastNumber + 1;
  }

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
    user: 'lmsbrainlyx@gmail.com', 
    pass: 'xyij lbvm trgo ljwg'     
  },
  tls: {
    rejectUnauthorized: false 
  }
});

// Hàm mẫu Email HTML
const emailTemplate = (name, content, buttonText, buttonUrl) => {
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      <style>
        body { background: #0a0a0f; font-family: Arial, sans-serif; margin: 0; padding: 40px 16px; }
        .email-wrapper { max-width: 620px; margin: auto; background: #0a0a0f; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;}
        .header { padding: 40px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .logo-name { font-size: 26px; font-weight: 800; color: #ffffff; margin: 0; }
        .body { background: #ffffff; padding: 40px; }
        .greeting { font-size: 22px; font-weight: 600; color: #0d0d14; }
        .message { font-size: 15px; line-height: 1.75; color: #4a4a5a; }
        .cta-btn { display: inline-block; background: linear-gradient(135deg, #1a8cff 0%, #7c4dff 100%); color: #ffffff !important; padding: 15px 40px; border-radius: 100px; text-decoration: none; font-weight: 600; }
        .footer { background: #0a0a0f; padding: 30px; color: rgba(255,255,255,0.25); text-align: center; font-size: 11px; }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <div class="logo-name">BrainlyX</div>
        </div>
        <div class="body">
          <p class="greeting">Xin chào, ${name} 👋</p>
          <p class="message">${content}</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${buttonUrl}" class="cta-btn">${buttonText}</a>
          </div>
        </div>
        <div class="footer">© 2026 BrainlyX University.</div>
      </div>
    </body>
    </html>
  `;
};

// Cấu hình giới hạn Đăng nhập sai (Anti Brute-force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { error: "Quá nhiều lần thử đăng nhập sai, vui lòng quay lại sau 15 phút." }
});

// --- CẤU HÌNH MULTER ĐỂ LƯU TRỮ FILE BÀI GIẢNG ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/lessons/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } 
});


// =========================================================================
// CHỨC NĂNG 1: QUẢN LÝ USER & AUTHENTICATION
// =========================================================================

app.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, class, created_at, status, role_id, university FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) return res.status(401).json({ error: "Email không tồn tại" });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Mật khẩu không chính xác" });

    if (user.status !== 'active') return res.status(403).json({ error: "Tài khoản của bạn đang bị khóa hoặc chờ xét duyệt!" });

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

app.post('/users', async (req, res) => {
  const { name, email, password, role_id, university, class: className } = req.body;
  try {
    const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) return res.status(400).json({ error: "Email này đã tồn tại!" });

    let prefix = "SV";
    if (role_id == 1) prefix = "AD";
    else if (role_id == 2) prefix = "GV";

    const customId = await generateCustomId(prefix);
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (id, name, email, password, role_id, status, university, class) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    await db.query(sql, [customId, name, email, hashedPassword, role_id, 'active', university, className || null]);

    res.status(201).json({ message: "Thêm người dùng mới thành công!", id: customId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/register', async (req, res) => {
  const { name, email, password, role, university, class: className } = req.body;
  try {
    const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) return res.status(400).json({ error: "Email này đã được sử dụng!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const isLecturerRole = (role === 'lecture' || role === 'lecturer' || role == 2);
    const prefix = isLecturerRole ? "GV" : "SV";
    const role_id = isLecturerRole ? 2 : 3;
    const status = isLecturerRole ? 'inactive' : 'active';

    const customId = await generateCustomId(prefix);
    const sql = 'INSERT INTO users (id, name, email, password, role_id, status, university, class) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    await db.query(sql, [customId, name, email, hashedPassword, role_id, status, university, className || null]);

    res.status(201).json({ message: "Đăng ký thành công!", id: customId, status });

    let mailContent = isLecturerRole ? "Tài khoản Giảng viên đang chờ Admin phê duyệt thủ công." : "Tài khoản Sinh viên đã kích hoạt thành công.";
    transporter.sendMail({
      from: '"BrainlyX" <lmsbrainlyx@gmail.com>',
      to: email,
      subject: 'Thông báo trạng thái đăng ký tài khoản',
      html: emailTemplate(name, mailContent, "Truy cập hệ thống", "http://localhost:5173")
    }).catch(err => console.error("Lỗi gửi mail hệ thống:", err.message));

  } catch (err) {
    res.status(500).json({ error: "Lỗi hệ thống khi đăng ký" });
  }
});

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
      html: emailTemplate(users[0].name, "Tài khoản giảng viên của bạn đã được phê duyệt.", "Đăng nhập ngay", "http://localhost:5173/login")
    });

    res.json({ success: true, message: "Đã phê duyệt và gửi mail thành công!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/reject', async (req, res) => {
  const { id } = req.body;
  try {
    const [users] = await db.query("SELECT email, name FROM users WHERE id = ?", [id]);
    if (users.length === 0) return res.status(404).json({ error: "User không tồn tại" });

    await transporter.sendMail({
      from: '"Hệ Thống LMS BrainlyX" <lmsbrainlyx@gmail.com>',
      to: users[0].email,
      subject: 'Thông báo kết quả đăng ký tài khoản',
      html: emailTemplate(users[0].name, "Yêu cầu đăng ký đã bị từ chối.", "Liên hệ hỗ trợ", "mailto:lmsbrainlyx@gmail.com")
    });

    await db.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ success: true, message: "Đã từ chối và xóa bản ghi chờ duyệt." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, university, status, class: className } = req.body;
    try {
        const sql = 'UPDATE users SET name = ?, university = ?, status = ?, class = ? WHERE id = ?';
        const [result] = await db.query(sql, [name, university, status, className || null, id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Không tìm thấy người dùng" });
        res.json({ message: "Cập nhật thông tin user thành công!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: "Xóa người dùng thành công!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =========================================================================
// CHỨC NĂNG 2: QUẢN LÝ KHÓA HỌC (COURSES API) - ĐÃ ĐỒNG BỘ VÀ TỐI ƯU
// =========================================================================

// 2.1 Giảng viên lấy toàn bộ danh sách lớp mình tạo
app.get('/api/courses/:lecturerId', async (req, res) => {
    const { lecturerId } = req.params;
    try {
        const [rows] = await db.query(
            "SELECT * FROM courses WHERE lecturer_id = ? AND delete_status != 'approved'", 
            [lecturerId]
        );
        res.json(rows); 
    } catch (err) {
        console.error("Lỗi MySQL:", err);
        res.status(500).json({ error: "Lỗi kết nối cơ sở dữ liệu" });
    }
});

// 2.2 Xem thông tin chi tiết của 1 khóa học bằng Id công khai
app.get('/api/courses/detail/:courseId', async (req, res) => {
    const { courseId } = req.params;
    try {
        // FIX logic đồng bộ tên cột `u.name` thay vì `u.full_name` cũ
        const sql = `
            SELECT c.*, u.name AS lecturer_name, u.university 
            FROM courses c 
            LEFT JOIN users u ON c.lecturer_id = u.id 
            WHERE c.id = ?
        `;
        const [rows] = await db.query(sql, [courseId]);

        if (rows.length === 0) return res.status(404).json({ error: "Không tìm thấy khóa học" });
        res.json(rows[0]); 
    } catch (err) {
        console.error("Lỗi MySQL:", err);
        res.status(500).json({ error: "Lỗi hệ thống khi lấy thông tin chi tiết lớp học" });
    }
});

// 2.3 API quan trọng: Sinh viên lấy danh sách các khóa học MÌNH ĐÃ THAM GIA (JOIN bảng enrollments)
app.get('/api/my-courses/:studentId', async (req, res) => {
    const { studentId } = req.params;
    try {
        // TRÁNH LỖI CŨ: Lọc chính xác bằng INNER JOIN và sửa thành `u.name` đúng cấu trúc DB mới
        const sql = `
            SELECT c.*, u.name AS lecturer_name 
            FROM courses c
            INNER JOIN enrollments e ON c.id = e.course_id
            LEFT JOIN users u ON c.lecturer_id = u.id
            WHERE e.student_id = ? AND c.delete_status != 'approved'
        `; 
        const [rows] = await db.query(sql, [studentId]);
        res.json(rows);
    } catch (err) {
        console.error("❌ Lỗi lấy lớp học của sinh viên:", err);
        res.status(500).json({ error: "Không thể lấy danh sách lớp học của bạn." });
    }
});

// 2.4 Giảng viên tạo khóa học mới (Có mật khẩu)
app.post('/api/courses', async (req, res) => {
    // FIX: Đã bổ sung trường `password` nhận từ Client để lưu vào DB
    const { course_name, course_code, password, description, lecturer_id } = req.body;
    
    try {
        const [existCode] = await db.query("SELECT id FROM courses WHERE course_code = ?", [course_code]);
        if (existCode.length > 0) return res.status(400).json({ error: "Mã môn học này đã tồn tại trên hệ thống!" });

        const sql = `
            INSERT INTO courses (course_name, course_code, password, description, lecturer_id, delete_status) 
            VALUES (?, ?, ?, ?, ?, 'none')
        `;
        const [result] = await db.query(sql, [course_name, course_code, password || null, description || null, lecturer_id]);
        
        res.status(201).json({ 
            success: true, 
            message: "Tạo môn học mới thành công!",
            courseId: result.insertId 
        });
    } catch (err) {
        console.error("Lỗi tạo khóa học:", err);
        res.status(500).json({ error: "Lỗi hệ thống khi tạo khóa học" });
    }
});

// 2.5 Giảng viên cập nhật thông tin lớp học
app.put('/api/courses/:id', async (req, res) => {
    const { id } = req.params;
    const { course_name, course_code, password, description } = req.body;
    
    try {
        const sql = `
            UPDATE courses 
            SET course_name = ?, course_code = ?, password = ?, description = ? 
            WHERE id = ?
        `;
        const [result] = await db.query(sql, [course_name, course_code, password || null, description, id]);

        if (result.affectedRows === 0) return res.status(404).json({ error: "Không tìm thấy khóa học để cập nhật" });
        res.json({ success: true, message: "Cập nhật khóa học thành công!" });
    } catch (err) {
        res.status(500).json({ error: "Lỗi hệ thống khi cập nhật khóa học" });
    }
});


// =========================================================================
// CHỨC NĂNG 3: TIẾN TRÌNH DUYỆT XÓA MÔN HỌC (ADMIN & LECTURER)
// =========================================================================

app.post('/api/courses/request-delete', async (req, res) => {
    const { id } = req.body;
    try {
        await db.query("UPDATE courses SET delete_status = 'pending' WHERE id = ?", [id]);
        res.json({ success: true, message: "Yêu cầu xóa môn học đã được gửi tới Ban quản trị Admin phê duyệt!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

app.post('/api/admin/course-process', async (req, res) => {
    const { id, action } = req.body; 
    try {
        if (action === 'approve') {
            // Thực hiện xóa cứng hoàn toàn khỏi DB (Bảng Enrollments/Lessons liên kết CASCADE sẽ tự động sạch)
            await db.query("DELETE FROM courses WHERE id = ?", [id]);
            res.json({ message: "Admin đã phê duyệt xóa vĩnh viễn khóa học này." });
        } else {
            await db.query("UPDATE courses SET delete_status = 'none' WHERE id = ?", [id]);
            res.json({ message: "Admin đã từ chối yêu cầu và giữ lại khóa học." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// =========================================================================
// CHỨC NĂNG 4: QUẢN LÝ BÀI GIẢNG ĐA PHƯƠNG TIỆN (LESSONS)
// =========================================================================

app.get('/api/lessons/:courseId', async (req, res) => {
    const { courseId } = req.params;
    try {
        const sql = 'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC, created_at ASC';
        const [rows] = await db.query(sql, [courseId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/lessons', upload.array('files', 5), async (req, res) => {
    const { id, course_id, title, content, links_data, order_index } = req.body;

    let filePathsArray = [];
    if (req.files && req.files.length > 0) {
        filePathsArray = req.files.map(file => `uploads/lessons/${file.filename}`);
    }

    if (!id || !course_id || !title) {
        if (req.files) req.files.forEach(file => { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); });
        return res.status(400).json({ error: 'Thiếu thông tin ID bài giảng hoặc tiêu đề.' });
    }

    try {
        let parsedLinks = [];
        let parsedLabels = [];

        if (links_data) {
            const rawLinksArray = JSON.parse(links_data); 
            if (Array.isArray(rawLinksArray)) {
                rawLinksArray.forEach(item => {
                    if (item.url) {
                        parsedLinks.push(item.url);
                        parsedLabels.push(item.label || "Liên kết tài liệu");
                    }
                });
            }
        }

        const filesJsonString = filePathsArray.length > 0 ? JSON.stringify(filePathsArray) : null;
        const linksJsonString = parsedLinks.length > 0 ? JSON.stringify(parsedLinks) : null;
        const labelsJsonString = parsedLabels.length > 0 ? JSON.stringify(parsedLabels) : null;

        const sql = 'INSERT INTO lessons (id, course_id, title, content, link, link_label, file, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        await db.query(sql, [
            id, course_id, title, content || null, 
            linksJsonString, labelsJsonString, filesJsonString, order_index || 0
        ]);
        
        return res.status(201).json({ message: "Bài giảng đa tài nguyên đã đăng thành công!" });
    } catch (dbErr) {
        if (req.files) req.files.forEach(file => { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); });
        return res.status(500).json({ error: 'Lỗi ghi cơ sở dữ liệu.' });
    }
});

app.post('/api/lessons/update', upload.array('files', 5), async (req, res) => {
    const { id, title, content, links_data, existing_files, order_index } = req.body;

    if (!id || !title) {
        if (req.files) req.files.forEach(file => { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); });
        return res.status(400).json({ error: 'Thiếu mã bài giảng hoặc tiêu đề cần sửa.' });
    }

    try {
        let finalFilesArray = [];
        if (existing_files) finalFilesArray = JSON.parse(existing_files);
        
        if (req.files && req.files.length > 0) {
            const newFiles = req.files.map(file => `uploads/lessons/${file.filename}`);
            finalFilesArray = [...finalFilesArray, ...newFiles];
        }

        let parsedLinks = [];
        let parsedLabels = [];
        if (links_data) {
            const rawLinksArray = JSON.parse(links_data);
            if (Array.isArray(rawLinksArray)) {
                rawLinksArray.forEach(item => {
                    if (item.url) {
                        parsedLinks.push(item.url);
                        parsedLabels.push(item.label || "Liên kết tài liệu");
                    }
                });
            }
        }

        const filesJsonString = finalFilesArray.length > 0 ? JSON.stringify(finalFilesArray) : null;
        const linksJsonString = parsedLinks.length > 0 ? JSON.stringify(parsedLinks) : null;
        const labelsJsonString = parsedLabels.length > 0 ? JSON.stringify(parsedLabels) : null;

        const sql = 'UPDATE lessons SET title = ?, content = ?, link = ?, link_label = ?, file = ?, order_index = ? WHERE id = ?';
        await db.query(sql, [title, content || null, linksJsonString, labelsJsonString, filesJsonString, order_index || 0, id]);

        return res.status(200).json({ message: "Cập nhật thông tin bài giảng thành công!" });
    } catch (dbErr) {
        if (req.files) req.files.forEach(file => { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); });
        return res.status(500).json({ error: 'Lỗi hệ thống khi cập nhật bài học.' });
    }
});

// Định cấu hình đường dẫn tĩnh công khai để Frontend có thể truy cập đọc File Vật lý (PDF/Docx)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => console.log(`🚀 BrainlyX Server đang chạy cực mượt tại cổng ${PORT}`));