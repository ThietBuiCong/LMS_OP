import { useState } from 'react';
import { Modal, Form, Input, message, Alert, Spin } from 'antd';
import { KeyOutlined, NumberOutlined } from '@ant-design/icons';
import axios from 'axios';

interface Props {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const ModalJoinCourse = ({ open, onCancel, onSuccess }: Props) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [requirePassword, setRequirePassword] = useState(false);
    const [courseInfo, setCourseInfo] = useState<any>(null);

    // BƯỚC 1: Kiểm tra sự tồn tại của mã lớp
    const handleCheckCourse = async () => {
        const codeValue = form.getFieldValue('course_code');

        if (!codeValue) {
            return message.warning("Vui lòng nhập mã lớp trước!");
        }

        setLoading(true);
        try {
            // Gọi API kiểm tra mã lớp (Ví dụ: IT134, XXX)
            const res = await axios.get(`/api/courses/check/${codeValue}`);
            const course = res.data;

            if (course) {
                setCourseInfo(course);
                // Kiểm tra xem cột password có dữ liệu không (theo image_87af75.png)
                if (course.password && course.password.trim() !== "") {
                    setRequirePassword(true);
                    message.info(`Lớp "${course.course_name}" yêu cầu mật khẩu để tham gia.`);
                } else {
                    // Nếu password là NULL/Rỗng, tiến hành tham gia luôn
                    await joinAction(course.course_code);
                }
            }
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                message.error("Mã lớp này không tồn tại trên hệ thống!");
            } else {
                message.error("Lỗi kết nối đến máy chủ, vui lòng thử lại sau.");
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // BƯỚC 2: Thực hiện tham gia vào khóa học
    const joinAction = async (courseCode: string, inputPassword?: string) => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        setLoading(true);
        try {
            await axios.post(`/api/courses/join`, {
                student_id: user.id, // ID của sinh viên (ví dụ: SV-000001)
                course_code: courseCode, // Mã lớp (ví dụ: XXX)
                password: inputPassword
            });
            message.success("Tham gia thành công!");
            handleClose();
            onSuccess();
        } catch (err: any) {
            // Nếu Backend trả về lỗi, catch sẽ xử lý ở đây thay vì treo 500
            message.error(err.response?.data?.message || "Lỗi hệ thống");
        } finally {
            setLoading(false);
        }
    };
    const handleClose = () => {
        form.resetFields();
        setRequirePassword(false);
        setCourseInfo(null);
        onCancel();
    };

    return (
        <Modal
            title={<span style={{ fontWeight: 'bold', letterSpacing: '1px' }}>THAM GIA KHÓA HỌC</span>}
            open={open}
            onCancel={handleClose}
            onOk={() => {
                if (!requirePassword) {
                    handleCheckCourse();
                } else {
                    form.validateFields(['password']).then(values => {
                        // Sử dụng mã lớp đã tìm thấy để join
                        joinAction(courseInfo.course_code, values.password);
                    });
                }
            }}
            okText={requirePassword ? "Xác nhận tham gia" : "Tìm kiếm lớp"}
            confirmLoading={loading}
            // Style Neo-Brutalism đồng bộ với hệ thống
            okButtonProps={{
                style: {
                }
            }}
            cancelButtonProps={{ style: { borderRadius: 0 } }}
        >
            <Spin spinning={loading}>
                <Form form={form} layout="vertical" style={{ marginTop: '10px' }}>
                    <Form.Item
                        name="course_code"
                        label="Mã khóa học (Mã định danh)"
                        rules={[{ required: true, message: 'Vui lòng nhập mã lớp!' }]}
                    >
                        <Input
                            prefix={<NumberOutlined />}
                            placeholder="Nhập mã lớp (Ví dụ: IT134, XXX...)"
                            disabled={requirePassword} // Khóa mã khi đã tìm thấy lớp
                            style={{ borderRadius: 0, border: '2px solid black' }}
                        />
                    </Form.Item>

                    {requirePassword && (
                        <>
                            <Alert
                                message={
                                    <span>
                                        Đã tìm thấy lớp: <b>{courseInfo?.course_name}</b>
                                    </span>
                                }
                                type="success"
                                showIcon
                                style={{ marginBottom: 15, borderRadius: 0, border: '1px solid #52c41a' }}
                            />
                            <Form.Item
                                name="password"
                                label="Mật khẩu lớp học"
                                rules={[{ required: true, message: 'Khóa học này yêu cầu mật khẩu!' }]}
                            >
                                <Input.Password
                                    prefix={<KeyOutlined />}
                                    placeholder="Nhập mật khẩu do giảng viên cung cấp"
                                    style={{ borderRadius: 0, border: '2px solid black' }}
                                />
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Spin>
        </Modal>
    );
};

export default ModalJoinCourse;