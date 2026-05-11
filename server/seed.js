const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');

async function seedDatabase() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '28112006a@B', // Thay password của bạn
        database: 'my_app_db'
    });

    console.log("🚀 Đang bắt đầu tạo 200 tài khoản...");

    const users = [];
    const password = await bcrypt.hash('123456', 10); // Dùng chung 1 pass cho dễ test

    for (let i = 0; i < 200; i++) {
        const role_id = faker.helpers.arrayElement([1, 2, 3]); // Random Admin, GV, SV
        
        // Tỷ lệ 70% bị khóa (inactive) để test bộ lọc
        const status = faker.helpers.maybe(() => 'inactive', { probability: 0.7 }) || 'active';
        
        const name = faker.person.fullName();
        const email = faker.internet.email();
        const university = faker.helpers.arrayElement(['BKU', 'IUH']);
        
        // Tạo ID theo format của bạn (ví dụ: TEST-000001)
        const id = `TEST-${i.toString().padStart(6, '0')}`;

        users.push([id, name, email, password, role_id, status, university]);
    }

    const sql = 'INSERT INTO users (id, name, email, password, role_id, status, university) VALUES ?';
    
    try {
        await db.query(sql, [users]);
        console.log("✅ Đã chèn thành công 200 tài khoản random!");
    } catch (err) {
        console.error("❌ Lỗi khi chèn dữ liệu:", err.message);
    } finally {
        await db.end();
    }
}

seedDatabase();