import { Form, Input, Button, message, Select, Alert } from "antd";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import "./register.css";

function Register() {
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        const payload = {
            name: values.username,
            email: values.email,
            password: values.password,
            role: values.role,
            className: values.class,
            university: values.university
        };

        try {
            const response = await fetch("http://localhost:5000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Có lỗi xảy ra khi đăng ký!");
            }

            if (result.status === 'inactive') {
                message.success("Đăng ký thành công! Vui lòng chờ Admin phê duyệt.");
            } else {
                message.success("Đăng ký thành công!");
            }

            navigate("/");
        } catch (error: any) {
            message.error(error.message);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
            <Header />
            
            <div className="flex-grow flex items-center justify-center p-4">
                <Form
                    name="basic"
                    layout="vertical" // QUAN TRỌNG: Chuyển sang dọc để Label nằm trên Input, cực đẹp trên mobile
                    style={{ 
                        width: '100%',
                        maxWidth: 500, // Tăng lên 500 cho thoải mái không gian
                        margin: "20px auto", 
                        padding: "clamp(15px, 5vw, 30px)", // Padding tự co giãn
                        backgroundColor: "white", 
                        borderRadius: 12, 
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)" 
                    }}
                    initialValues={{ role: "student" }}
                    onFinish={onFinish}
                >
                    <h2 style={{ textAlign: 'center', marginBottom: 24, fontSize: '24px', fontWeight: 'bold' }}>
                        Tạo tài khoản mới
                    </h2>

                    <Form.Item
                        label="Bạn là:"
                        name="role"
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                    >
                        <Select
                            size="large"
                            options={[
                                { value: 'lecture', label: 'Giảng viên' },
                                { value: 'student', label: 'Sinh viên' },
                            ]}
                            placeholder="Chọn vai trò"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Alert
                            message="Giảng viên cần Admin phê duyệt mới có thể đăng nhập."
                            type="info"
                            showIcon
                        />
                    </Form.Item>

                    <Form.Item
                        label="Tên đăng nhập"
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập username!' }]}
                    >
                        <Input placeholder="Username" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}
                    >
                        <Input placeholder="Email" size="large" />
                    </Form.Item>

                    {/* Logic hiển thị Class chỉ cho Sinh viên */}
                    <Form.Item
                        noStyle
                        shouldUpdate={(prev, curr) => prev.role !== curr.role}
                    >
                        {({ getFieldValue }) =>
                            getFieldValue('role') === 'student' ? (
                                <Form.Item
                                    label="Lớp"
                                    name="class"
                                    rules={[{ required: true, message: 'Vui lòng nhập lớp!' }]}
                                >
                                    <Input placeholder="Ví dụ: IT02" size="large" />
                                </Form.Item>
                            ) : null
                        }
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password placeholder="Password" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Xác nhận mật khẩu"
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Confirm Password" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Trường đại học"
                        name="university"
                        rules={[{ required: true, message: 'Vui lòng chọn trường!' }]}
                    >
                        <Select
                            size="large"
                            options={[
                                { value: 'IUH', label: 'Công nghiệp TP.HCM (IUH)' },
                                { value: 'BKU', label: 'Bách Khoa TP.HCM (BKU)' },
                            ]}
                            placeholder="Chọn trường"
                        />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 24 }}>
                        <Button type="primary" htmlType="submit" size="large" block>
                            Đăng ký ngay
                        </Button>
                    </Form.Item>
                </Form>
            </div>
            <Footer />
        </div>
    );
}

export default Register;