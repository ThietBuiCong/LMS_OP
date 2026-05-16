import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './page/login-register/loginPage.tsx';
import AdminHomePage from './page/function/admin/adminHomePage.tsx';
import Register from './page/login-register/registerPage.tsx';
import { ConfigProvider } from 'antd';
import CourseDetail from './page/function/course/courseInformation.tsx';
import UserHomePage from './page/function/user/userPageHome.tsx';
import CourseDetailForStudent from './page/function/course/courseInforStudent.tsx';
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
          <Route path="/home/user/userHomePage" element={<UserHomePage />} />
          {/* <Route path="/home/user/student/studentHomePage" element={<StudentHomePage />} /> */}
          <Route path="/register" element={<Register />} />
          <Route path="/course/:courseId" element={<CourseDetail />} />
          <Route path="/home/user/student/course/:courseId" element={<CourseDetailForStudent />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;