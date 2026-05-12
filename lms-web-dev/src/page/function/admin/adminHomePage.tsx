import { useEffect, useState, } from 'react';
import { Button, Layout, Menu, Space, Badge } from 'antd';
import { LeftSquareOutlined, RightSquareOutlined, UserOutlined, SettingOutlined, LogoutOutlined, ContainerOutlined } from '@ant-design/icons';
import 'tailwindcss';
import UserManagements from './userManagement';
import UserRequest from './userRequest';
import axios from 'axios';
import { fetchUsers } from '../../../api/data/getUserInfor';
import { useNavigate } from 'react-router-dom';

const { Sider, Content } = Layout;


function AdminHomePage() {
    const navigate = useNavigate();
    const [pendingCount, setPendingCount] = useState(0);
    const fetchCounts = async () => {
        try {
            // Lấy user pending
            const users = await fetchUsers();
            const uCount = users.filter((u: any) => u.status === 'inactive' && u.role_id === 2).length;

            // Lấy course pending
            const courseRes = await axios.get("http://localhost:5000/api/admin/course-requests");
            const cCount = courseRes.data.length;

            setPendingCount(uCount + cCount);
        } catch (e) { console.log(e); }
    };
    useEffect(() => {
        fetchCounts(); // Gọi hàm lấy số lượng yêu cầu
    }, []);
    const [collapsed, setCollapsed] = useState(false);

    const [selectedKey, setSelectedKey] = useState("1");

    return (
        <div> {/* Đảm bảo bao ngoài là flex */}

            {/* Sử dụng Layout để chứa Sider và Content */}
            <Layout>
                <Sider collapsed={collapsed} width={250} theme="light" className="shadow-md trigger={null}">
                    <Button onClick={() => setCollapsed(!collapsed)}
                        style={{
                            width: "100%",
                        }}
                    >
                        {collapsed ? <RightSquareOutlined /> : <LeftSquareOutlined />}
                    </Button>
                    <Menu
                        mode="inline" // Chế độ inline đảm bảo menu đổ dọc
                        defaultSelectedKeys={['1']}
                        style={{ display: 'flex', flexDirection: 'column', padding: '16px' }}
                        onClick={(item) => {
                            setSelectedKey(item.key);
                        }}
                        items={[
                            { key: '1', icon: <UserOutlined />, label: 'Quản lý tài khoản' },
                            {
                                key: '2',
                                icon: <ContainerOutlined />,
                                label: (
                                    <Space>
                                        Yêu cầu
                                        {/* Badge sẽ hiện số lượng đỏ nhỏ bên cạnh chữ Yêu cầu */}
                                        <Badge  count={pendingCount} size="small" offset={[5, 0]} />
                                    </Space>
                                )
                            },
                            { key: '3', icon: <LogoutOutlined />, label: 'Đăng xuất', onClick: () => navigate('/') },
                        ]}
                    />
                </Sider>
                <Content>

                    {selectedKey === "1" && <UserManagements />}
                    {selectedKey === "2" && <UserRequest />}

                </Content>
            </Layout>
        </div>
    );
};

export default AdminHomePage;