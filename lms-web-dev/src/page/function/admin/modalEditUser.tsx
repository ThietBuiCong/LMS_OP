import { Modal, Form, Input, Select, message } from 'antd';
import { useEffect } from 'react';
import axios from 'axios';

interface Props {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    userData: any; // Dữ liệu user đang chọn để sửa
}

const ModalEditUser = ({ open, onCancel, onSuccess, userData }: Props) => {
    const [form] = Form.useForm();

    // Mỗi khi userData thay đổi (nhấn nút Sửa), cập nhật giá trị vào Form
    useEffect(() => {
        if (userData) {
            form.setFieldsValue(userData);
        }
    }, [userData, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            await axios.put(`/api/users/${userData.id}`, values);
            message.success("Cập nhật thông tin thành công!");
            onSuccess();
            onCancel();
        } catch (error) {
            message.error("Lỗi khi cập nhật!");
        }
    };

    return (
        <Modal title="Chỉnh sửa thông tin" open={open} onOk={handleOk} onCancel={onCancel} okText="Lưu" cancelText="Hủy">
            <Form form={form} layout="vertical">
                <Form.Item name="name" label="Họ và tên" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="university" label="Đại học">
                    <Select options={[
                        { label: 'Bách Khoa', value: 'BKU' },
                        { label: 'Công nghiệp', value: 'IUH' },
                    ]} />
                </Form.Item>
                <Form.Item name="status" label="Trạng thái">
                    <Select options={[
                        { label: 'Hoạt động', value: 'active' },
                        { label: 'Đã khóa', value: 'inactive' },
                    ]} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalEditUser;