import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Modal, Form, Input, Tag, message, Typography, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const { confirm } = Modal;

interface Course {
    id: number;
    course_name: string;
    course_code: string;
    description: string;
    delete_status: 'none' | 'pending' | 'approved';
}

const CourseEdit: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [form] = Form.useForm();

    // Lấy lecturer_id từ localStorage đã lưu khi login
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const lecturerId = savedUser.id;

    const loadCourses = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/courses/${lecturerId}`);
            setCourses(res.data);
        } catch (error) {
            message.error("Không thể tải danh sách khóa học");
        } finally {
            setLoading(false);
        }
    }, [lecturerId]);

    useEffect(() => { loadCourses(); }, [loadCourses]);

    // Xử lý Thêm/Sửa
    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            if (editingCourse) {
                await axios.put(`http://localhost:5000/api/courses/${editingCourse.id}`, values);
                message.success("Cập nhật khóa học thành công");
            } else {
                await axios.post(`http://localhost:5000/api/courses`, { ...values, lecturer_id: lecturerId });
                message.success("Tạo khóa học thành công");
            }
            setIsModalOpen(false);
            loadCourses();
        } catch (error) {
            message.error("Có lỗi xảy ra");
        }
    };

    // Xử lý yêu cầu Xóa (Chờ Admin duyệt)
    const showDeleteConfirm = (courseId: number) => {
        confirm({
            title: 'Bạn có chắc chắn muốn xóa khóa học này?',
            icon: <ExclamationCircleOutlined />,
            content: 'Lưu ý: Yêu cầu xóa sẽ được gửi đến Admin để phê duyệt trước khi bị gỡ hoàn toàn.',
            okText: 'Gửi yêu cầu xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await axios.post(`http://localhost:5000/api/courses/request-delete`, { id: courseId });
                    message.info("Đã gửi yêu cầu xóa lên Admin");
                    loadCourses();
                } catch (error) {
                    message.error("Không thể gửi yêu cầu");
                }
            },
        });
    };

    const columns = [
        { title: 'Mã lớp', dataIndex: 'course_code', key: 'course_code' },
        { title: 'Tên khóa học', dataIndex: 'course_name', key: 'course_name' },
        { 
            title: 'Trạng thái', 
            dataIndex: 'delete_status', 
            key: 'delete_status',
            render: (status: string) => {
                if (status === 'pending') return <Tag color="warning">Đang chờ xóa</Tag>;
                return <Tag color="success">Đang hoạt động</Tag>;
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: Course) => (
                <Space size="middle">
                    <Button 
                        type="link" 
                        icon={<EditOutlined />} 
                        disabled={record.delete_status === 'pending'}
                        onClick={() => {
                            setEditingCourse(record);
                            form.setFieldsValue(record);
                            setIsModalOpen(true);
                        }}
                    >
                        Sửa
                    </Button>
                    <Button 
                        type="link" 
                        danger 
                        icon={<DeleteOutlined />} 
                        disabled={record.delete_status === 'pending'}
                        onClick={() => showDeleteConfirm(record.id)}
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px', background: '#fff', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <Title level={3} style={{ margin: 0 }}>Quản lý khóa học</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                    setEditingCourse(null);
                    form.resetFields();
                    setIsModalOpen(true);
                }}>
                    Tạo khóa học mới
                </Button>
            </div>

            <Table 
                columns={columns} 
                dataSource={courses} 
                rowKey="id" 
                loading={loading}
                pagination={{ pageSize: 5 }}
            />

            <Modal
                title={editingCourse ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
                open={isModalOpen}
                onOk={handleSave}
                onCancel={() => setIsModalOpen(false)}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
                    <Form.Item name="course_code" label="Mã khóa học" rules={[{ required: true, message: 'Vui lòng nhập mã!' }]}>
                        <Input placeholder="Ví dụ: IT001" />
                    </Form.Item>
                    <Form.Item name="course_name" label="Tên khóa học" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                        <Input placeholder="Ví dụ: Lập trình hướng đối tượng" />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CourseEdit;