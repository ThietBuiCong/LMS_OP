import { useState, } from 'react';
import { Avatar, Button, Layout, Menu, Typography, Divider, Dropdown, Drawer, message } from 'antd';
import { LeftSquareOutlined, RightSquareOutlined, UserOutlined, SnippetsOutlined, SettingOutlined, ContainerOutlined, GitlabOutlined, EditOutlined, ProfileOutlined, LogoutOutlined } from '@ant-design/icons';
import 'tailwindcss';
import UserRequest from '../../admin/userRequest';
import { BookIcon } from '@phosphor-icons/react/dist/icons/Book';
import CourseManagement from './courseManagement';
import { useNavigate } from 'react-router-dom';
import CourseEdit from './courseEditPage';

const { Sider, Content } = Layout;
const { Text } = Typography;


function LectureHomePage() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };

    const [collapsed, setCollapsed] = useState(false);
    const [selectedKey, setSelectedKey] = useState("1");

    // Lấy thông tin user từ localStorage
    const savedUser = localStorage.getItem("user");
    const user = savedUser ? JSON.parse(savedUser) : { name: "Khách", role_id: "3" };

    const getEmail = (email: string) => {
        return email;
    };


    // Chuyển role_id thành tên hiển thị
    const getRoleName = (roleId: string | number) => {
        if (roleId == 1) return "Quản trị viên";
        if (roleId == 2) return "Giảng viên";
        return "Sinh viên";
    };
    return (
        <div> {/* Đảm bảo bao ngoài là flex */}

            {/* Sử dụng Layout để chứa Sider và Content */}
            <Layout>
                <Sider
                    collapsed={collapsed}
                    width={250}
                    theme="light"
                    className="shadow-md"
                    style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, left: 0 }}
                >
                    {/* Phần Menu ở trên */}
                    <div style={{ flex: 1 }}>
                        <Button onClick={() => setCollapsed(!collapsed)} style={{ width: "100%", borderRadius: 0, border: 'none', borderBottom: '1px solid #f0f0f0' }}>
                            {collapsed ? <RightSquareOutlined /> : <LeftSquareOutlined />}
                        </Button>
                        <Menu
                            mode="inline"
                            style={{
                                display: "flex",
                                flexDirection: "column"
                            }}
                            selectedKeys={[selectedKey]}
                            onClick={(item) => setSelectedKey(item.key)}
                            items={[
                                { key: '1', icon: <BookIcon />, label: 'Quản lý khóa học' },
                                { key: '2', icon: <SnippetsOutlined />, label: 'Chỉnh sửa' },
                                //{ key: 'user-btn', icon: <UserOutlined />, label: user.name.split(' ').pop(), onClick: showDrawer }, 
                                { key: '3', icon: <GitlabOutlined />, label: 'AI'  , onClick: () => message.info("Tính năng đang phát triển") },
                            ]}
                        />
                        <Button
                            type="text"
                            icon={<UserOutlined />}
                            onClick={showDrawer}
                            style={{
                                width: '100%',
                                position: 'absolute',
                                bottom: 0,
                                borderTop: '1px solid #f0f0f0',
                                borderRadius: 0,
                            }}
                        >
                            {user.name.split(' ').pop()}
                        </Button>
                    </div>

                    {/* PHẦN AVATAR Ở DƯỚI CÙNG */}
                    <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>



                    </div>
                </Sider>
                <Drawer
                    title="Thông tin tài khoản"
                    closable={{ 'aria-label': 'Close Button' }}
                    onClose={onClose}
                    open={open}
                >

                    <div style={{
                        display: "flex",
                        justifyContent: "space-around",
                        alignItems: "center",
                        backgroundColor: "#002aff",
                        padding: "20px",
                        borderRadius: "8px",
                        color: "#fff",
                        flexDirection: "column",
                    }}>
                        <Avatar size={64} icon={<UserOutlined />} />
                        <p style={{ fontWeight: "bold" }}>Họ và tên: {user.name}</p>
                        <p>Chức vụ: {getRoleName(user.role_id)}</p>
                    </div>
                    <Menu style={{ marginTop: "20px" }} items={[
                        { key: 'profile', icon: <EditOutlined />, label: 'Chỉnh sửa thông tin', onClick: () => message.info("Tính năng đang phát triển") },
                        {
                            key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', onClick: () => {
                                localStorage.removeItem("user");
                                navigate("/");
                            }
                        },
                    ]} />
                </Drawer>
                <Content>

                    {selectedKey === "1" && <CourseManagement />}
                    {selectedKey === "2" && <CourseEdit />}
                    {selectedKey === "3" && <CourseManagement />}
                </Content>
            </Layout>
        </div>
    );
};
export default LectureHomePage;