import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Typography, Tag, Empty, Spin, message } from 'antd';
import { PlusOutlined, UserOutlined, ArrowRightOutlined, BookOutlined } from '@ant-design/icons';
import ModalJoinCourse from './modalAddCourse'; // Đảm bảo đúng tên file
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const StudentHomePage: React.FC = () => {
    const [myCourses, setMyCourses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    // Lấy thông tin user từ localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // Sử dụng useCallback để tránh re-render vô hạn
    const fetchMyCourses = useCallback(async () => {
        if (!user.id) return;
        
        setLoading(true);
        try {
            // API lấy danh sách khóa học mà sinh viên đã tham gia
            const res = await axios.get(`/api/my-courses/${user.id}`);
            setMyCourses(res.data);
        } catch (error) {
            console.error("Lỗi tải khóa học:", error);
            message.error("Không thể tải danh sách khóa học của bạn");
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => { 
        fetchMyCourses(); 
    }, [fetchMyCourses]);

    return (
        <div style={{ padding: '24px', minHeight: '80vh' }}>
            {/* Header section */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 40,
                borderBottom: '4px solid black',
                paddingBottom: '20px'
            }}>
                <div>
                    <Title level={2} style={{  }}>
                        <BookOutlined /> Khóa học của tôi
                    </Title>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#666' }}>
                        Chào mừng {user.name}!
                    </p>
                </div>
                
                <Button 
                    type="primary" 
                    size="large"
                    icon={<PlusOutlined />} 
                    onClick={() => setIsModalOpen(true)}
                    style={{ 
                    }}
                >
                    THAM GIA KHÓA HỌC MỚI
                </Button>
            </div>

            {/* Content section */}
            <Spin spinning={loading} tip="Đang tải danh sách bài học...">
                <Row gutter={[32, 32]}>
                    {myCourses.length > 0 ? (
                        myCourses.map((course: any) => (
                            <Col xs={24} sm={12} lg={8} key={course.id}>
                                <Card 
                                    hoverable 
                                    style={{ 
                                    }}
                                    bodyStyle={{ padding: '24px' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                                        <Tag color="black" style={{ borderRadius: 0, fontWeight: 'bold' }}>
                                            {course.course_code}
                                        </Tag>
                                    </div>

                                    <Title level={3} style={{ marginTop: 0, height: '60px', overflow: 'hidden' }}>
                                        {course.course_name}
                                    </Title>
                                    
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <UserOutlined style={{ fontSize: '18px' }} />
                                            <span style={{ fontWeight: 'bold' }}>GV: {course.lecturer_name}</span>
                                        </div>
                                    </div>

                                    <Button 
                                        block 
                                        size="large"
                                        type="default" 
                                        icon={<ArrowRightOutlined />}
                                        style={{ 
                                        }}
                                        onClick={() => navigate(`/home/user/student/course/${course.id}`) }
                                    >
                                    </Button>
                                </Card>
                            </Col>
                        ))
                    ) : (
                        <Col span={24}>
                            <div style={{ 
                                padding: '60px', 
                                textAlign: 'center', 
                                border: '3px dashed #ccc',
                                background: '#fff' 
                            }}>
                                <Empty description="Bạn chưa tham gia khóa học nào. Hãy nhấn nút phía trên để bắt đầu!" />
                            </div>
                        </Col>
                    )}
                </Row>
            </Spin>

            {/* Modal tham gia lớp */}
            <ModalJoinCourse 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchMyCourses(); // Tự động load lại danh sách sau khi join thành công
                }}
            />
        </div>
    );
};

export default StudentHomePage;