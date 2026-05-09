import { useEffect, useState, useCallback } from "react";
import { Table, Button, Tooltip, Tag, Space, Popconfirm, message } from 'antd';
import { PlusSquareTwoTone, MinusSquareTwoTone, ReloadOutlined } from '@ant-design/icons';
import { fetchUsers } from "../../../api/data/getUserInfor";
import ModalAddUser from "./modalAddUser";
import { deleteUser } from "../../../api/data/deleteUserInfor";


// 1. Cập nhật Interface
interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    status: 'active' | 'inactive';
    role_name: string; // Đây là tên role lấy từ bảng roles qua JOIN
    university: string; // Trường đại học
}

function UserManagements() {
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchUsers();
            console.log("Dữ liệu từ API:", data); // QUAN TRỌNG: Kiểm tra dòng này ở F12
            setUsers(data);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleDelete = async (id: number) => {
        try {
            await deleteUser(id);
            message.success("Xóa thành công");
            loadUsers(); // Tải lại bảng
        } catch (error) {
            message.error("Không thể xóa người dùng");
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: 'Tên người dùng', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Vai trò',
            dataIndex: 'role_id', // Phải khớp với tên trong SELECT ở Backend
            key: 'role_id',
            render: (roleId: number | string) => {
                // Chuyển đổi ID số thành chữ để người dùng dễ đọc
                const roles: { [key: string]: { name: string, color: string } } = {
                    '1': { name: 'ADMIN', color: 'volcano' },
                    '2': { name: 'LECTURER', color: 'green' },
                    '3': { name: 'STUDENT', color: 'blue' }
                };

                const currentRole = roles[String(roleId)] || { name: 'USER', color: 'blue' };

                return <Tag color={currentRole.color}>{currentRole.name}</Tag>;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                </Tag>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '---',
        }, {
            title: 'Đại học',
            dataIndex: 'university',
            key: 'university',
            render: (uni: string) => {
                const university: { [key: string]: { name: string, color: string } } = {
                    'BKU': { name: 'Trường Đại học Bách Khoa', color: 'volcano' },
                    'IUH': { name: 'Trường Đại học Công nghiệp TP.HCM', color: 'green' },
                };
                return university[uni]?.name || '---';
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: User) => (
                <Popconfirm
                    title="Xóa tài khoản"
                    onConfirm={() => handleDelete(record.id)}
                >
                    <Button type="text" danger icon={<MinusSquareTwoTone twoToneColor="#ff4d4f" />} />
                </Popconfirm>
            ),
        },
    ];

    return (
        <div style={{ padding: 20, backgroundColor: "#fff", borderRadius: 8 }}>
            <Space style={{ marginBottom: 16 }}>
                <Tooltip title="Thêm tài khoản mới">
                    <Button
                        icon={<PlusSquareTwoTone />}
                        type="text"
                        size="large"
                        onClick={() => setIsModalOpen(true)}
                    />
                </Tooltip>
                <Tooltip title="Làm mới bảng">
                    <Button
                        onClick={loadUsers}
                        icon={<ReloadOutlined style={{ color: '#1890ff' }} />}
                        type="text"
                        size="large"
                        loading={loading}
                    />
                </Tooltip>
            </Space>

            <Table
                dataSource={users}
                columns={columns}
                loading={loading}
                rowKey="id"
                bordered
                pagination={{ pageSize: 8 }}
            />

            <ModalAddUser
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSuccess={loadUsers}
            />
        </div>
    );
}

export default UserManagements;