import { Row, Button, Divider, Col, Card, Typography, Tag, Space, Spin, Empty, message } from 'antd';
import { BookOutlined, TeamOutlined, MoreOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios'; // Dùng axios để tận dụng baseURL
import { useNavigate } from 'react-router-dom';



const { Title, Text } = Typography;

function CourseManagement() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const loadCourses = useCallback(async () => {
        // 1. Lấy thông tin user từ localStorage (đã lưu khi login thành công)
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            message.error("Không tìm thấy thông tin đăng nhập");
            return;
        }
        
        const user = JSON.parse(userStr);
        const lecturerId = user.id; // Lấy ID giảng viên (Ví dụ: GV-000001)

        setLoading(true);
        try {
            // 2. Gọi API thật đã định nghĩa ở Backend: app.get('/api/courses/:lecturerId')
            const response = await axios.get(`/api/courses/${lecturerId}`);
            
            // Backend của bạn trả về: res.json(rows)
            setCourses(response.data);
        } catch (error: any) {
            console.error("Lỗi API:", error);
            message.error("Không thể tải danh sách khóa học");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { 
        loadCourses(); 
    }, [loadCourses]);

    const handleCourseClick = (courseId: number, courses: any) => {
        if(courses.delete_status === 'pending') {
            message.warning("Khóa học đang chờ xóa, không thể truy cập");
            return;
        }
        navigate(`/course/${courseId}`);
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" tip="Đang tải khóa học..." /></div>;

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <Title level={3}>Khóa học đang dạy</Title>
                {/* <Button type="primary" icon={<BookOutlined />}>Thêm khóa học</Button> */}
            </div>

            {courses.length > 0 ? (
                <Row gutter={[24, 24]}>
                    {courses.map((course) => (
                        <Col xs={24} sm={12} lg={8} key={course.id}>
                            <Card 
                                hoverable 
                                bordered={false}
                                className="shadow-sm"
                                //extra={<Button type="text" icon={<MoreOutlined />} />}
                                onClick={() => handleCourseClick(course.id, course)}
                            >
                                <Tag color="black" style={{ marginBottom: 12, fontWeight: 'bold' }}>
                                    {course.course_code}
                                </Tag>
                                <Title level={5} style={{ margin: '0 0 16px 0' }}>{course.course_name}</Title>
                                <Text type="secondary" italic>{course.description}</Text>
                                
                                <Divider style={{ margin: '12px 0', borderBlockStart: '1px solid #000' }} />
                                
                                <Space size="large">
                                    <Space><TeamOutlined /> <Text>Lớp: {course.id}</Text></Space>
                                    <Tag color={course.delete_status === 'none' ? 'green' : 'volcano'}>
                                        {course.delete_status === 'none' ? 'Đang hoạt động' : 'Chờ xóa'}
                                    </Tag>
                                </Space>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Empty description="Bạn chưa tạo khóa học nào" />
            )}
        </div>
    );
}

export default CourseManagement;