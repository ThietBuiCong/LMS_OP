import { Modal, Form, Input, message, Select } from 'antd';
import { createUser } from '../../../api/data/postUserInfor';


interface ModalAddUserProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void; // Để load lại bảng sau khi thêm thành công
}

const ModalAddUser = ({ open, onCancel, onSuccess }: ModalAddUserProps) => {
    const [form] = Form.useForm();

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            // values lúc này sẽ là: { name: "...", email: "...", password: "...", role_id: 1 }
            console.log("Dữ liệu gửi đi:", values); // Thêm dòng này để kiểm tra ở Console F12

            await createUser(values);
            message.success("Thêm người dùng thành công!");
            form.resetFields();
            onSuccess();
            onCancel();
        } catch (error: any) {
            message.error(error.message || "Thêm thất bại");
        }
    };
    return (  
        <Modal
            title="Thêm người dùng mới"
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            okText="Xác nhận"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical" name="addUserForm">
                <Form.Item
                    name="name"
                    label="Họ và tên"
                    rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                >
                    <Input placeholder="Nhập tên người dùng" />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}
                >
                    <Input placeholder="Nhập email" />
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                >
                    <Input.Password placeholder="Nhập mật khẩu" />
                </Form.Item>

                {/* THÊM TRƯỜNG CHỌN VAI TRÒ Ở ĐÂY */}
                <Form.Item
                    name="role_id"
                    label="Vai trò hệ thống"
                    initialValue={3} // Mặc định chọn User (ID = 3)
                >
                    <Select placeholder="Chọn vai trò">
                        <Select.Option value={1}>Quản trị viên (Admin)</Select.Option>
                        <Select.Option value={2}>Giảng viên (Lecture)</Select.Option>
                        <Select.Option value={3}>Người dùng thường (User)</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    name="university"
                    label="Tên trường"
                    initialValue={"BKU"} // Mặc định chọn Đại học Bách Khoa TP.HCM
                >
                    <Select placeholder="Chọn trường">
                        <Select.Option value={"BKU"}>Đại học Bách Khoa TP.HCM</Select.Option>
                        <Select.Option value={"IUH"}>Đại học Công nghiệp TP.HCM</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalAddUser;