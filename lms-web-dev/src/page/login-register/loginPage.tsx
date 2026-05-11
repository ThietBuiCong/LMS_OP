import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { Form, Input, Button, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import bgImage from "../../assets/bg-login.png";
import axios from "axios"; // Import axios
import "./login.css";

function Login() {
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        try {
            // 1. Gọi API Login
            const response = await axios.post("http://localhost:5000/login", {
                email: values.email,
                password: values.password,
            });

            const { token, user, message: msg } = response.data;

            // 2. Lưu thông tin vào LocalStorage để dùng cho các trang sau
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("userRole", user.role_id); // role_id từ DB (2: GV, 3: SV)

            
            message.success(msg);

            // 3. Phân luồng điều hướng dựa trên role_id trong DB của bạn
            // Dựa trên code API của bạn: Giảng viên (isLecturerRole ? 2 : 3)
            if (user.role_id === 2 || user.role_id === "2") {
                navigate("/home/user/lecture/lectureHomePage");
            } else if (user.role_id === 3 || user.role_id === "3") {
                navigate("/home/user/student/studentHomePage");
            } else if (user.role_id === 1 || user.role_id === "1") {
                navigate("/home/admin/adminHomePage"); // Route cho Admin nếu có
            }

        } catch (error: any) {
            // Bắt lỗi từ Server (Sai pass, tài khoản chưa kích hoạt, v.v...)
            if (error.response) {
                message.error(error.response.data.error || "Đăng nhập thất bại");
            } else {
                message.error("Không thể kết nối đến máy chủ!");
            }
        }
    };

    return (
        <div
            id="login-page"
            style={{ backgroundImage: `url(${bgImage})` }}
            className="flex flex-col min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
        >
            <Header />
            <div className="flex-grow flex items-center justify-center p-4" style={{ minHeight: "50vh" }}>
                <Form
                    name="login_form"
                    layout="vertical"
                    style={{
                        width: '100%',
                        maxWidth: 400,
                        padding: "32px",
                        backgroundColor: "rgba(255, 255, 255, 0.98)",
                        borderRadius: 16,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                        margin: "20px auto",
                    }}
                    onFinish={onFinish}
                >
                    <Form.Item>
                        <h2 style={{ textAlign: "center", margin: 0, fontSize: "26px", fontWeight: 800 }}>
                            ĐĂNG NHẬP
                        </h2>
                        <p style={{ textAlign: "center", color: "#666", marginTop: 8 }}>BrainlyX System</p>
                    </Form.Item>

                    <Form.Item
                        label={<span style={{ fontWeight: 600 }}>Email</span>}
                        name="email"
                        rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
                    >
                        <Input placeholder="example@gmail.com" size="large" />
                    </Form.Item>

                    <Form.Item
                        label={<span style={{ fontWeight: 600 }}>Mật khẩu</span>}
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password placeholder="••••••••" size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block 
                            style={{ height: '48px', fontWeight: 600, borderRadius: 8 }}>
                            Đăng Nhập
                        </Button>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: "center" }}>
                        <span>Bạn chưa có tài khoản? </span>
                        <Link style={{ color: "#1890ff", fontWeight: 600 }} to={"/register"}>
                            Đăng ký
                        </Link>
                    </Form.Item>
                </Form>
            </div>
            <Footer />
        </div>
    );
}

export default Login;