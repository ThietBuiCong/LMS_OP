import { useState,} from 'react';
import { Button, Layout, Menu } from 'antd';
import { LeftSquareOutlined, RightSquareOutlined, UserOutlined, SettingOutlined, ContainerOutlined } from '@ant-design/icons';
import 'tailwindcss';
import UserManagements from './userManagement';
import UserRequest from './userRequest';

const { Sider, Content } = Layout;


function AdminHomePage() {

    

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
                            { key: '2', icon: <ContainerOutlined />, label: 'Yêu Cầu' },
                            { key: '3', icon: <SettingOutlined />, label: 'Cài đặt' },
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