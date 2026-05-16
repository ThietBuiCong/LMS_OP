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
            const response = await axios.post("/login", {
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
            if(user.role_id === 1) {
                navigate("/home/admin/adminHomePage");
            } else{
                navigate("/home/user/userHomePage");
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
            style={{
                backgroundImage: `url(${bgImage})`, // 1. Đảm bảo toàn bộ thẻ div lớn có màu chữ trắng
                minHeight: "100vh",
            }}
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
                        borderRadius: 16,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                        margin: "20px auto",
                        backgroundColor: "rgba(255, 255, 255, 1)", // Nền trong suốt hơn để thấy rõ background
                        // 2. Thêm dòng này để màu chữ bên trong Form mặc định là trắng
                        color: "white"
                    }}
                    onFinish={onFinish}
                >
                    <Form.Item>
                        {/* 3. Đổi h2 sang màu trắng */}
                        <h2 style={{ textAlign: "center", margin: 0, fontSize: "26px", fontWeight: 800,  }}>
                            ĐĂNG NHẬP
                        </h2>
                        {/* 4. Đổi p từ #666 sang trắng mờ (rgba trắng) để trông sang hơn */}
                        <p style={{ textAlign: "center", marginTop: 8 }}>BrainlyX System</p>
                    </Form.Item>

                    <Form.Item
                        // 5. Đổi màu label thành trắng
                        label={<span style={{ fontWeight: 600, }}>Email</span>}
                        name="email"
                        rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
                    >
                        <Input style={{
                            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                            backgroundColor: "rgba(255, 255, 255, 0.2)", // Làm nền nhạt hơn để chữ nổi lên
                            backdropFilter: "blur(10px)",
                            WebkitBackdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.3)", // 6. Đổi màu chữ khi gõ vào Input thành trắng
                        }} placeholder="example@gmail.com" size="large" className="white-placeholder" />
                    </Form.Item>

                    <Form.Item
                        // 7. Đổi màu label thành trắng
                        label={<span style={{ fontWeight: 600,  }}>Mật khẩu</span>}
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password style={{
                            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            backdropFilter: "blur(10px)",
                            WebkitBackdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                        }} placeholder="••••••••" size="large" className="white-placeholder" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block
                            style={{ height: '48px', fontWeight: 600, borderRadius: 8 }}>
                            Đăng Nhập
                        </Button>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: "center"}}>
                        <span>Bạn chưa có tài khoản? </span>
                        {/* 9. Đổi màu Link đăng ký sang trắng hoặc xanh sáng để nổi bật */}
                        <Link style={{ fontWeight: 800, textDecoration: "underline" }} to={"/register"}>
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