import { Form, Input, Button, message, Select, Alert } from "antd";
import Marquee from "react-fast-marquee";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import "./register.css";

function Register() {
    const navigate = useNavigate();

    // Ant Design sẽ tự động chạy hàm này khi form hợp lệ
    const onFinish = async (values: any) => {
        // Chuẩn bị payload để gửi xuống Backend
        const payload = {
            name: values.username, // Đổi username từ form thành name cho backend
            email: values.email,
            password: values.password,
            role: values.role.toLowerCase(), // Chuyển 'Lecture' thành 'lecture' để backend nhận diện đúng

            // Backend của bạn hiện tại chưa có cột class và university, 
            // nhưng bạn có thể gửi kèm để sau này dễ thêm vào DB
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

            // Kiểm tra lỗi từ backend (ví dụ: Trùng email)
            if (!response.ok) {
                throw new Error(result.error || "Có lỗi xảy ra khi đăng ký!");
            }

            // Xử lý thông báo theo status trả về từ backend
            if (result.status === 'inactive') {
                message.success("Đăng ký thành công! Vui lòng chờ Admin phê duyệt.");
            } else {
                message.success("Đăng ký thành công!");
            }

            navigate("/"); // Chuyển về trang đăng nhập
        } catch (error: any) {
            message.error(error.message);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
            <Header />
            <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600, margin: "auto", marginBlock: 50, padding: 20, backgroundColor: "white", borderRadius: 8, boxShadow: "0 10px 8px rgba(0,0,0,0.1)" }}
                initialValues={{ role: "Student" }}
                onFinish={onFinish} // Gọi API khi bấm Submit
            >
                <Form.Item
                    label="Role"
                    name="role"
                    rules={[{ required: true, message: 'Please select your role!' }]}
                >
                    <Select
                        options={[
                            { value: 'Lecture', label: 'Giảng viên' },
                            { value: 'Student', label: 'Sinh viên' },
                        ]}
                        placeholder="Select Role"
                    />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Alert
                        message="Lưu ý: Tài khoản giảng viên sẽ cần được Admin phê duyệt trước khi có thể đăng nhập!"
                        type="info"
                        showIcon
                    />
                </Form.Item>

                <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                >
                    <Input placeholder="Username" />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}
                >
                    <Input placeholder="Email" />
                </Form.Item>

                <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}
                >
                    {({ getFieldValue }) =>
                        getFieldValue('role') === 'Student' ? (
                            <Form.Item
                                label="Class"
                                name="class"
                                rules={[{ required: true, message: 'Please input your class!' }]}
                            >
                                <Input placeholder="Class" />
                            </Form.Item>
                        ) : null
                    }
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password placeholder="Password" />
                </Form.Item>

                {/* Confirm Password với logic check khớp mật khẩu trực tiếp trong Form */}
                <Form.Item
                    label="Confirm Password"
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                        { required: true, message: 'Please confirm your password!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="Confirm Password" />
                </Form.Item>

                <Form.Item
                    label="University"
                    name="university"
                    rules={[{ required: true, message: 'Please select your university!' }]}
                >
                    <Select
                        options={[
                            { value: 'IUH', label: 'Industrial University of Ho Chi Minh' },
                            { value: 'BKU', label: 'Ho Chi Minh University of Technology' },
                        ]}
                        placeholder="Select School"
                    />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
            <Footer />
        </div>
    );
}

export default Register;