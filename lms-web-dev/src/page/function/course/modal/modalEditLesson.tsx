import { useState, useEffect } from 'react';
import { Modal, Form, Input, message, Upload, Button, Space, Divider, List, Typography } from 'antd';
import { FileTextOutlined, PlusOutlined, DeleteOutlined, LinkOutlined, TagOutlined } from '@ant-design/icons';
import axios from 'axios';

const Text = Typography;

interface Props {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    lessonData: any; // Nhận toàn bộ thông tin bài học cũ được chọn để edit
}

const ModalEditLesson = ({ open, onCancel, onSuccess, lessonData }: Props) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    
    // Lưu trữ danh sách file vật lý cũ đang có trên server của bài học này
    const [oldFiles, setOldFiles] = useState<string[]>([]);

    // Đổ dữ liệu bài học cũ vào Form ngay khi mở Modal
    useEffect(() => {
        if (open && lessonData) {
            // 1. Phân tách ngược mảng link từ JSON văn bản trong DB
            let initialLinks = [];
            if (lessonData.link) {
                try {
                    const urls = JSON.parse(lessonData.link);
                    const labels = JSON.parse(lessonData.link_label || '[]');
                    initialLinks = urls.map((url: string, idx: number) => ({
                        url: url,
                        label: labels[idx] || "Liên kết tài liệu"
                    }));
                } catch (e) {
                    initialLinks = [{ url: lessonData.link, label: lessonData.link_label || "Liên kết" }];
                }
            }

            // 2. Phân tách ngược danh sách file vật lý cũ
            let initialFiles = [];
            if (lessonData.file) {
                try { initialFiles = JSON.parse(lessonData.file); } catch (e) { initialFiles = [lessonData.file]; }
            }
            setOldFiles(initialFiles);

            // Thiết lập giá trị mặc định hiển thị lên các ô nhập liệu của Form
            form.setFieldsValue({
                title: lessonData.title,
                content: lessonData.content,
                links: initialLinks,
                files: [] // File mới upload thêm sẽ nằm ở đây (bắt đầu bằng mảng rỗng)
            });
        }
    }, [open, lessonData, form]);

    const normFile = (e: any) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
    };

    // Xử lý xóa bớt file vật lý cũ trực tiếp trên giao diện chỉnh sửa
    const handleDeleteOldFile = (filePathToDelete: string) => {
        setOldFiles(prev => prev.filter(path => path !== filePathToDelete));
    };

    const handleOk = () => {
        form.validateFields()
            .then(async (formValues) => {
                setLoading(true);
                
                const formData = new FormData();
                formData.append('id', lessonData.id); // Ép chặt ID bài học cần sửa
                formData.append('title', formValues.title);
                formData.append('content', formValues.content || '');
                
                // Gửi danh sách mảng link mới cập nhật
                const linksArray = formValues.links || [];
                formData.append('links_data', JSON.stringify(linksArray));
                
                // Gửi danh sách các file cũ còn giữ lại lên server để đồng bộ
                formData.append('existing_files', JSON.stringify(oldFiles));
                
                // Gửi kèm thêm các file vật lý mới được tải lên thêm (nếu có)
                if (formValues.files && formValues.files.length > 0) {
                    formValues.files.forEach((fileObj: any) => {
                        formData.append('files', fileObj.originFileObj);
                    });
                }

                await axios.post(`/api/lessons/update`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                message.success("Cập nhật nội dung bài giảng thành công!");
                form.resetFields();
                onSuccess();
            })
            .catch((error) => {
                if (error.response?.data?.error) {
                    message.error(error.response.data.error);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <Modal
            title="Chỉnh sửa thông tin bài giảng"
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            confirmLoading={loading}
            destroyOnClose
            width={650}
        >
            <Form form={form} layout="vertical">
                <Form.Item name="title" label="Tiêu đề bài giảng" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                    <Input disabled={loading} />
                </Form.Item>

                <Form.Item name="content" label="Nội dung tóm tắt">
                    <Input.TextArea rows={3} disabled={loading} />
                </Form.Item>

                <Divider style={{ fontSize: '13px' }}>Chỉnh sửa các đường dẫn đính kèm</Divider>

                <Form.List name="links">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8, width: '100%' }} align="baseline">
                                    <Form.Item {...restField} name={[name, 'label']} rules={[{ required: true, message: 'Nhập tên hiển thị!' }]} style={{ marginBottom: 0, width: '200px' }}>
                                        <Input prefix={<TagOutlined />} placeholder="Tên hiển thị" disabled={loading} />
                                    </Form.Item>
                                    <Form.Item {...restField} name={[name, 'url']} rules={[{ required: true, message: 'Nhập đường dẫn URL!' }]} style={{ marginBottom: 0, width: '300px' }}>
                                        <Input prefix={<LinkOutlined />} placeholder="https://..." disabled={loading} />
                                    </Form.Item>
                                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} disabled={loading} />
                                </Space>
                            ))}
                            <Form.Item style={{ marginTop: '10px' }}>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} disabled={loading}>
                                    Thêm đường dẫn mới
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                {/* HIỂN THỊ DANH SÁCH FILE VẬT LÝ CŨ ĐỂ GIẢNG VIÊN BIẾT VÀ XÓA BỚT NẾU MUỐN */}
                {oldFiles.length > 0 && (
                    <>
                        <Divider style={{ fontSize: '13px', color: '#fa8c16' }}>Các tệp cũ hiện có (Bấm xóa nếu muốn gỡ bỏ)</Divider>
                        <List
                            size="small"
                            bordered
                            dataSource={oldFiles}
                            renderItem={(filePath) => {
                                const fileName = filePath.split('/').pop() || 'Tài liệu đính kèm';
                                return (
                                    <List.Item actions={[<Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteOldFile(filePath)} />]}>
                                        <Space><FileTextOutlined /> <Text style={{ fontSize: '13px' }}>{fileName}</Text></Space>
                                    </List.Item>
                                );
                            }}
                        />
                    </>
                )}

                <Divider style={{ fontSize: '13px' }}>Tải lên thêm tệp tin vật lý mới (Tối đa 5 tệp)</Divider>

                <Form.Item name="files" valuePropName="fileList" getValueFromEvent={normFile}>
                    <Upload.Dragger name="files" maxCount={5} multiple={true} disabled={loading} beforeUpload={() => false}>
                        <p className="ant-upload-drag-icon"><FileTextOutlined /></p>
                        <p className="ant-upload-text">Kéo thả hoặc nhấp để tải bổ sung thêm tệp tin mới lên server</p>
                    </Upload.Dragger>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalEditLesson;