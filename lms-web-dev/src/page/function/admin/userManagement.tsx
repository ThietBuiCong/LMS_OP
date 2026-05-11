import { useEffect, useState, useCallback, useRef } from "react";
import { Table, Button, Tooltip, Tag, Space, Badge, Popconfirm, message, Input, type InputRef } from 'antd';
import {
    PlusSquareTwoTone,
    MinusSquareTwoTone,
    ReloadOutlined,
    SearchOutlined,
    EditTwoTone
} from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import type { FilterConfirmProps } from 'antd/es/table/interface';
import { fetchUsers } from "../../../api/data/getUserInfor";
import ModalAddUser from "./modalAddUser";
import { deleteUser } from "../../../api/data/deleteUserInfor";
import ModalEditUser from "./modalEditUser";

// 1. Cập nhật Interface
interface User {
    id: string;
    name: string;
    email: string;
    created_at: string;
    status: 'active' | 'inactive';
    role_id: number | string;
    university: string;
}

type DataIndex = keyof User;

function UserManagements() {
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);


    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const showEditModal = (user: User) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };
    
    // Search states
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef<InputRef>(null);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchUsers();
            setUsers(data);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
            message.error("Không thể tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleDelete = async (id: string) => {
        try {
            await deleteUser(id);
            message.success("Xóa thành công");
            loadUsers();
        } catch (error) {
            message.error("Không thể xóa người dùng");
        }
    };

    // Hàm xử lý tìm kiếm trên từng cột
    const handleSearch = (
        selectedKeys: string[],
        confirm: (param?: FilterConfirmProps) => void,
        dataIndex: DataIndex,
    ) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<User> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Tìm kiếm ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Tìm
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Xóa
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => close()}
                    >
                        Đóng
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                ?.toString()
                .toLowerCase()
                .includes((value as string).toLowerCase()) ?? false,
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
    });

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            sorter: (a: User, b: User) => a.id.localeCompare(b.id),
        },
        {
            title: 'Tên người dùng',
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps('name'),
            sorter: (a: User, b: User) => a.name.localeCompare(b.name),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ...getColumnSearchProps('email'),
        },
        {
            title: 'Vai trò',
            dataIndex: 'role_id',
            key: 'role_id',
            filters: [
                { text: 'ADMIN', value: 1 },
                { text: 'LECTURER', value: 2 },
                { text: 'STUDENT', value: 3 },
            ],
            onFilter: (value: any, record: User) => record.role_id == value,
            render: (roleId: number | string) => {
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
            filters: [
                { text: 'Hoạt động', value: 'active' },
                { text: 'Đã khóa', value: 'inactive' },
            ],
            onFilter: (value: any, record: User) => record.status === value,
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
            sorter: (a: User, b: User) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : '---',
        },
        {
            title: 'Đại học',
            dataIndex: 'university',
            key: 'university',
            filters: [
                { text: 'Bách Khoa', value: 'BKU' },
                { text: 'Công nghiệp', value: 'IUH' },
            ],
            onFilter: (value: any, record: User) => record.university === value,
            render: (uni: string) => {
                const university: { [key: string]: { name: string, color: string } } = {
                    'BKU': { name: 'Bách Khoa', color: 'volcano' },
                    'IUH': { name: 'Công nghiệp', color: 'green' },
                };
                return university[uni]?.name || '---';
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: User) => (
                <Space size="middle">
                    {/* NÚT SỬA */}
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditTwoTone />}
                            onClick={() => showEditModal(record)}
                        />
                    </Tooltip>

                    <Popconfirm
                        title="Xóa tài khoản"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button type="text" danger icon={<MinusSquareTwoTone twoToneColor="#ff4d4f" />} />
                    </Popconfirm>
                </Space>
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
                columns={columns as any}
                loading={loading}
                rowKey="id"
                bordered
                pagination={{
                    pageSize: 8,
                    showSizeChanger: true,
                    pageSizeOptions: ['8', '20', '50']
                }}
            />

            <ModalAddUser
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSuccess={loadUsers}
            />
            <ModalEditUser
                open={isEditModalOpen}
                userData={selectedUser}
                onCancel={() => setIsEditModalOpen(false)}
                onSuccess={loadUsers}
            />
        </div>
    );
}

export default UserManagements;