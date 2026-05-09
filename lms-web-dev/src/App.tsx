import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Thêm BrowserRouter
import Login from './page/login-register/loginPage.tsx';
import AdminHomePage from './page/home/admin/adminHomePage.tsx';
import Register from './page/login-register/registerPage.tsx';

function App() {
  return (
    // Phải bọc toàn bộ bằng Router thì các đường dẫn mới hoạt động
    <Router>
      <Routes>
        {/* Route chỉ được nằm bên trong Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/home/admin/adminHomePage" element={<AdminHomePage />} />
        <Route path="/register" element={<Register />} /> {/* Thêm route cho trang đăng ký */}
      </Routes>
    </Router>
  );
}

export default App;