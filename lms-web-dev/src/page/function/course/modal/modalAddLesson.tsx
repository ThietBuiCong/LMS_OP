import { useState } from 'react';
import { Modal, Form, Input, message, Upload, Button, Space, Divider } from 'antd';
import { FileTextOutlined, PlusOutlined, DeleteOutlined, LinkOutlined, TagOutlined } from '@ant-design/icons';
import axios from 'axios';

interface Props {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    course_ID: any;
}

const ModalAddLesson = ({ open, onCancel, onSuccess, course_ID }: Props) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const normFile = (e: any) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
    };

    const handleOk = () => {
        form.validateFields()
            .then(async (formValues) => {
                setLoading(true);
                
                const lastWordOfTitle = formValues.title ? formValues.title.trim().split(/\s+/).pop() : "NEW";
                const randomSuffix = Math.floor(1000 + Math.random() * 9000); 
                const lessonId = `LS-${lastWordOfTitle}-${randomSuffix}`;

                const formData = new FormData();
                formData.append('id', lessonId);
                formData.append('course_id', course_ID);
                formData.append('title', formValues.title);
                formData.append('content', formValues.content || '');
                
                // ĐÃ NÂNG CẤP: Đóng gói mảng danh sách link thành chuỗi JSON gửi lên thông qua FormData
                const linksArray = formValues.links || []; // Lấy từ Form.List dữ liệu [{label: '...', url: '...'}]
                formData.append('links_data', JSON.stringify(linksArray));
                
                // Xử lý gửi nhiều file vật lý đính kèm
                if (formValues.files && formValues.files.length > 0) {
                    formValues.files.forEach((fileObj: any) => {
                        formData.append('files', fileObj.originFileObj);
                    });
                }

                await axios.post(`/api/lessons`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                message.success("Đăng bài giảng kèm danh mục tài nguyên thành công!");
                form.resetFields();
                onSuccess();
            })
            .catch((error) => {
                if (error.response?.data?.error) {
                    message.error(`Thất bại: ${error.response.data.error}`);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <Modal
            title="Tạo bài giảng mới"
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            confirmLoading={loading}
            destroyOnClose
            width={650}
        >
            <Form form={form} layout="vertical">
                <Form.Item name="title" label="Tiêu đề bài giảng" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                    <Input placeholder="Ví dụ: Bài giảng tuần 2" disabled={loading} />
                </Form.Item>

                <Form.Item name="content" label="Nội dung tóm tắt">
                    <Input.TextArea rows={3} placeholder="Hướng dẫn hoặc lưu ý học tập" disabled={loading} />
                </Form.Item>

                <Divider style={{ fontSize: '13px' }}>🔗 Các đường dẫn / Link Drive đính kèm</Divider>

                {/* THÀNH PHẦN QUẢN LÝ THÊM NHIỀU LINK ĐỘNG (FORM.LIST) */}
                <Form.List name="links">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8, width: '100%' }} align="baseline">
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'label']}
                                        rules={[{ required: true, message: 'Nhập tên hiển thị!' }]}
                                        style={{ marginBottom: 0, width: '200px' }}
                                    >
                                        <Input prefix={<TagOutlined />} placeholder="Tên hiển thị (Ví dụ: Link Drive Slide)" disabled={loading} />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'url']}
                                        rules={[{ required: true, message: 'Nhập đường dẫn URL!' }]}
                                        style={{ marginBottom: 0, width: '300px' }}
                                    >
                                        <Input prefix={<LinkOutlined />} placeholder="https://drive.google.com/..." disabled={loading} />
                                    </Form.Item>
                                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} disabled={loading} />
                                </Space>
                            ))}
                            <Form.Item style={{ marginTop: '10px' }}>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} disabled={loading}>
                                    Thêm đường dẫn / Link tài liệu Drive
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                <Divider style={{ fontSize: '13px' }}>📂 Các tệp tin vật lý tải lên hệ thống</Divider>

                <Form.Item name="files" label="Tải lên tài liệu (Tối đa 5 tệp - Giới hạn 10MB/Tệp)" valuePropName="fileList" getValueFromEvent={normFile}>
                    <Upload.Dragger name="files" maxCount={5} multiple={true} disabled={loading} beforeUpload={() => false}>
                        <p className="ant-upload-drag-icon"><FileTextOutlined /></p>
                        <p className="ant-upload-text">Kéo thả hoặc nhấp để chuẩn bị tải lên nhiều tệp tin cùng lúc</p>
                    </Upload.Dragger>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalAddLesson;