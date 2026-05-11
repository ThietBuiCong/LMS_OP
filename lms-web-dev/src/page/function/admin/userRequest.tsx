import { useEffect, useState, useCallback } from "react";
import { Table, Button, Tag, Space, Popconfirm, message, Card, Typography, Divider } from 'antd';
import { CheckOutlined, CloseOutlined, ReloadOutlined, WarningOutlined } from '@ant-design/icons';
import { fetchUsers } from "../../../api/data/getUserInfor";
import { approveUser } from "../../../api/data/approveUser";
import { deleteUser } from "../../../api/data/deleteUserInfor";
import axios from "axios";

const { Text, Title } = Typography;

interface User {
    id: string;
    name: string;
    email: string;
    created_at: string;
    status: 'active' | 'inactive';
    role_id: number;
    university: string;
}

interface CourseRequest {
    id: number;
    course_name: string;
    course_code: string;
    lecturer_name: string;
}

function UserRequest() {
    const [loading, setLoading] = useState(false);
    const [userRequests, setUserRequests] = useState<User[]>([]);
    const [courseRequests, setCourseRequests] = useState<CourseRequest[]>([]);

    const loadAllRequests = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Load User Requests
            const userData = await fetchUsers();
            const pendingLecturers = userData.filter((user: any) => 
                user.status === 'inactive' && user.role_id === 2
            );
            setUserRequests(pendingLecturers);

            // 2. Load Course Delete Requests
            const courseRes = await axios.get("http://localhost:5000/api/admin/course-requests");
            setCourseRequests(courseRes.data);
        } catch (error) {
            message.error("Lỗi tải dữ liệu yêu cầu");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadAllRequests(); }, [loadAllRequests]);

    // Xử lý User
    const handleApproveUser = async (id: string) => {
        try {
            await approveUser(id);
            message.success("Đã phê duyệt giảng viên");
            loadAllRequests();
            // await onActionSuccess();    
        } catch (error) { message.error("Thất bại"); }
    };

    const handleRejectUser = async (id: string) => {
        try {
            await deleteUser(id);
            message.warning("Đã từ chối yêu cầu");
            loadAllRequests();
        } catch (error) { message.error("Lỗi thao tác"); }
    };

    // Xử lý Course
    const handleProcessCourse = async (id: number, action: 'approve' | 'reject') => {
        try {
            await axios.post("http://localhost:5000/api/admin/course-process", { id, action });
            message.success(action === 'approve' ? "Đã xóa khóa học" : "Đã hủy yêu cầu xóa");
            loadAllRequests();
        } catch (error) { message.error("Lỗi xử lý"); }
    };

    const userColumns = [
        { title: 'Họ và tên', dataIndex: 'name', key: 'name', render: (text: string) => <Text strong>{text}</Text> },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Đại học', dataIndex: 'university', key: 'university', render: (uni: string) => <Tag color="blue">{uni}</Tag> },
        { title: 'Thao tác', key: 'action', render: (_: any, record: User) => (
            <Space>
                <Popconfirm title="Phê duyệt giảng viên?" onConfirm={() => handleApproveUser(record.id)}><Button type="primary" size="small" icon={<CheckOutlined />}>Duyệt</Button></Popconfirm>
                <Popconfirm title="Từ chối yêu cầu?" onConfirm={() => handleRejectUser(record.id)} okButtonProps={{ danger: true }}><Button danger size="small" icon={<CloseOutlined />}>Từ chối</Button></Popconfirm>
            </Space>
        )},
    ];

    const courseColumns = [
        { title: 'Mã lớp', dataIndex: 'course_code', key: 'course_code', render: (t: string) => <Tag color="cyan">{t}</Tag> },
        { title: 'Tên khóa học', dataIndex: 'course_name', key: 'course_name' },
        { title: 'Giảng viên', dataIndex: 'lecturer_name', key: 'lecturer_name' },
        { title: 'Thao tác', key: 'action', render: (_: any, record: CourseRequest) => (
            <Space>
                <Popconfirm title="Xác nhận xóa vĩnh viễn?" onConfirm={() => handleProcessCourse(record.id, 'approve')} okButtonProps={{ danger: true }}><Button type="primary" danger size="small">Duyệt xóa</Button></Popconfirm>
                <Button size="small" onClick={() => handleProcessCourse(record.id, 'reject')}>Hủy</Button>
            </Space>
        )},
    ];

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title={<Space><CheckOutlined /><span>Yêu cầu Đăng ký Giảng viên</span></Space>} extra={<Button icon={<ReloadOutlined />} onClick={loadAllRequests} />} className="shadow-sm">
                <Table columns={userColumns} dataSource={userRequests} rowKey="id" loading={loading} pagination={{ pageSize: 5 }} />
            </Card>

            <Card title={<Space><WarningOutlined style={{color: '#ff4d4f'}} /><span>Yêu cầu Xóa Khóa học</span></Space>} className="shadow-sm">
                <Table columns={courseColumns} dataSource={courseRequests} rowKey="id" loading={loading} pagination={{ pageSize: 5 }} />
            </Card>
        </Space>
    );
}

export default UserRequest;