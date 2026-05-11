import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './page/login-register/loginPage.tsx';
import AdminHomePage from './page/function/admin/adminHomePage.tsx';
import Register from './page/login-register/registerPage.tsx';
import LectureHomePage from './page/function/user/lecture/lecturePageHome.tsx';
import { ConfigProvider } from 'antd';

function App() {
  return (
    // 1. ConfigProvider bọc ngoài cùng để áp đặt style cho toàn bộ App
    <ConfigProvider
      theme={{
        token: {
          // Khi bạn chỉnh ở đây, toàn bộ Input, Button của AntD sẽ tự đổi theo
          controlHeight: 40, 
          borderRadius: 8,
          colorPrimary: '#1890ff', // Bạn có thể chỉnh màu chủ đạo ở đây
        },
        components: {
          Form: {
            itemMarginBottom: 16, // Khoảng cách giữa các ô nhập liệu
          },
          Button: {
            controlHeightLG: 45, // Chỉnh riêng cho nút size="large"
          }
        },
      }}
    >
      {/* 2. Router nằm bên trong để điều hướng */}
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home/admin/adminHomePage" element={<AdminHomePage />} />
          <Route path="/home/user/lecture/lectureHomePage" element={<LectureHomePage />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;