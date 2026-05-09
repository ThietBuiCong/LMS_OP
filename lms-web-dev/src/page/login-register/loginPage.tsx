import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { Form, Input, Button, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import bgImage from "../../assets/bg-login.png";
import "./login.css";

function Login() {
    const navigate = useNavigate();

    // Dùng onFinish của Ant Design sẽ giúp tự động bắt lỗi trống form (rules)
    const onFinish = (values: any) => {
        const { email, password } = values;

        console.log("Email:", email);
        console.log("Password:", password);

        // Demo kiểm tra tài khoản
        if (email === "admin@gmail.com" && password === "123456") {
            message.success("Đăng nhập thành công!");
            navigate("/home/admin/adminHomePage");
        } else {
            message.error("Sai email hoặc mật khẩu");
        }
    };

    return (
        <div
            style={{ backgroundImage: `url(${bgImage})` }}
            // Đã thêm class bg-fixed vào đây, và xóa các style dư thừa ở trên
            className="flex flex-col min-h-screen bg-cover bg-center bg-no-repeat bg-fixed bg-gradient-to-br from-green-50 via-white to-green-100"
        >
            <Header />

            {/* Vùng bọc Form: Dùng flex để đẩy cục Form vào đúng vị trí "chính giữa" màn hình */}
            <div className="flex-grow flex items-center justify-center">
                <Form
                    name="basic"
                    layout="vertical" // ĐỔI SANG VERTICAL: Chữ và ô nhập sẽ ngay ngắn thẳng hàng
                    style={{
                        width: '100%',
                        maxWidth: 400, // Đã thu gọn bề ngang form lại một chút cho cân đối
                        padding: 30,
                        border: "1px solid #d9d9d9",
                        backgroundColor: "rgba(255, 255, 255, 0.95)", // Form màu trắng hơi trong suốt
                        borderRadius: 12, // Bo góc cho mềm mại
                        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                        justifyContent: "center",
                        height: "80vh",
                        margin: "50px",
                    }}
                    onFinish={onFinish}
                >
                    <Form.Item style={{ marginBottom: 30 }}>
                        <h2 style={{ textAlign: "center", margin: 0, fontSize: "24px", fontWeight: "bold" }}>
                            Đăng Nhập | BrainlyX
                        </h2>
                    </Form.Item>

                    <Form.Item
                        label={<span style={{ fontWeight: 500 }}>Email</span>}
                        name="email"
                        rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
                    >
                        <Input placeholder="Nhập email" size="large" />
                    </Form.Item>

                    <Form.Item
                        label={<span style={{ fontWeight: 500 }}>Password</span>}
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu" size="large" />
                    </Form.Item>

                    {/* Nút đăng nhập: Thêm thuộc tính `block` để nút kéo dài 100% */}
                    <Form.Item style={{ marginTop: 10 }}>
                        <Button type="primary" htmlType="submit" size="large" block>
                            Đăng Nhập
                        </Button>
                    </Form.Item>

                    {/* Căn giữa dòng chữ "Chưa có tài khoản?" */}
                    <Form.Item style={{ marginBottom: 0, textAlign: "center" }}>
                        <p>
                            Chưa có tài khoản?{" "}
                            <Link style={{ color: "#1890ff", fontWeight: 500 }} to={"/register"}>
                                Đăng ký ngay
                            </Link>
                        </p>
                    </Form.Item>
                </Form>
            </div>

            <Footer />
        </div>
    );
}

export default Login;