import { useEffect, useState } from "react";
import { Table, Button, Tag, Space, Popconfirm, message, Card } from 'antd';
import { CheckOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import { fetchUsers } from "../../../api/data/getUserInfor"; // Giả định hàm này lấy list user
import { data } from "react-router-dom";
import { approveUser } from "../../../api/data/approveUser";
import { deleteUser } from "../../../api/data/deleteUserInfor";;
// Bạn cần tạo thêm 1 file api để update status
//import { approveUser } from "../../../api/data/approveUser"; 

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    status: 'active' | 'pending' | 'inactive';
    role_name?: string; // Thêm dấu ? vì có thể không có nếu chưa JOIN
    role_id: number;    // Thêm dòng này
    university: string;
}

const rejectUser = async (id: number) => {
        try {
            await deleteUser(id);
            message.success("Xóa thành công");
        } catch (error) {
            message.error("Không thể xóa người dùng");
        }
    };

function UserRequest() {
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState<User[]>([]);

    // Hàm lấy danh sách yêu cầu phê duyệt
    const loadRequests = async () => {
        setLoading(true);
        try {
            const data = await fetchUsers(); // data ở đây là mảng 11 phần tử bạn vừa gửi

            const pendingLecturers = data.filter((user: any) => {
                // Kiểm tra trạng thái đúng là 'inactive'
                const isInactive = user.status === 'inactive';

                // Kiểm tra role: 
                // Lưu ý: Trong dữ liệu bạn gửi không hiện rõ 'role_name'. 
                // Nếu bạn đã JOIN SQL thì kiểm tra role_name, 
                // nếu chưa JOIN thì hãy kiểm tra bằng role_id (ví dụ giảng viên là ID 2)
                const isLecturer = user.role_name === 'Lecture' || user.role_id === 2;

                return isInactive && isLecturer;
            });

            setRequests(pendingLecturers);
        } catch (error) {
            message.error("Lỗi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };
    const handleReject = async (id: number) => {
        try {
            await rejectUser(id);
            message.warning("Đã từ chối và xóa yêu cầu!");
            loadRequests(); // Refresh lại bảng
        } catch (error) {
            message.error("Lỗi khi thực hiện thao tác!");
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    // Hàm xử lý Phê duyệt
    const handleApprove = async (id: number) => { // Thêm async vào đây
        try {
            await approveUser(id);
            message.success("Thành công!");
            loadRequests();
        } catch (error) {
            message.error("Thất bại!");
        }
    };

    const columns = [
        {
            title: 'Họ và tên',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <span className="font-bold">{text}</span>
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Trường đại học',
            dataIndex: 'university',
            key: 'university',
            render: (uni: string) => <Tag color="blue">{uni}</Tag>
        },
        {
            title: 'Ngày gửi',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: () => <Tag color="warning">ĐANG CHỜ DUYỆT</Tag>
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: User) => (
                <Space size="middle">
                    <Popconfirm
                        title="Phê duyệt giảng viên"
                        onConfirm={() => handleApprove(record.id)}
                        okText="Đồng ý"
                        cancelText="Hủy"
                    >
                        <Button type="primary" icon={<CheckOutlined />} className="bg-green-500">
                            Chấp nhận
                        </Button>
                    </Popconfirm>

                    <Popconfirm
                        title="Từ chối yêu cầu"
                        description="Tài khoản này sẽ bị xóa khỏi hệ thống, bạn chắc chứ?"
                        onConfirm={() => handleReject(record.id)} // Gọi hàm xóa ở đây
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger icon={<CloseOutlined />}>
                            Từ chối
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title="Danh sách yêu cầu đăng ký Giảng viên"
            extra={<Button icon={<ReloadOutlined />} onClick={loadRequests}>Làm mới</Button>}
            className="shadow-md"
        >
            <Table
                columns={columns}
                dataSource={requests}
                rowKey="id"
                loading={loading}
                locale={{ emptyText: "Không có yêu cầu nào đang chờ" }}
            />
        </Card>
    );
}

export default UserRequest;