import { Row, Button, Divider, Col, Card, Typography, Tag, Space, Spin, Empty, message } from 'antd';
import { BookOutlined, TeamOutlined, MoreOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useState } from 'react';
import { fetchUsers } from "../../../../api/data/getUserInfor";

const { Title, Text } = Typography;

function CourseManagement() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadCourses = useCallback(async () => {
        setLoading(true);
        try {
            // Sau này thay bằng API thật
            const mockData = [
                { id: 1, name: 'Lập trình React cơ bản', code: 'REACT101', students: 25, status: 'active' },
                { id: 2, name: 'Thiết kế UI/UX', code: 'UIUX202', students: 18, status: 'active' },
                { id: 3, name: 'Node.js Backend', code: 'NODE303', students: 12, status: 'inactive' },
            ];
            setCourses(mockData);
        } catch (error) {
            message.error("Lỗi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadCourses(); }, [loadCourses]);

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin /></div>;

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <Title level={3}>Khóa học đang dạy</Title>
                <Button type="primary" icon={<BookOutlined />}>Thêm khóa học</Button>
            </div>

            {courses.length > 0 ? (
                <Row gutter={[24, 24]}>
                    {courses.map((course) => (
                        <Col xs={24} sm={12} lg={8} key={course.id}>
                            <Card 
                                hoverable 
                                bordered={false}
                                className="shadow-sm"
                                style={{ borderRadius: '8px' }}
                                extra={<Button type="text" icon={<MoreOutlined />} />}
                            >
                                <Tag color="blue" style={{ marginBottom: 12 }}>{course.code}</Tag>
                                <Title level={5} style={{ margin: '0 0 16px 0' }}>{course.name}</Title>
                                
                                <Divider style={{ margin: '12px 0' }} />
                                
                                <Space size="large">
                                    <Space><TeamOutlined /> <Text type="secondary">{course.students} Học viên</Text></Space>
                                    <Tag color={course.status === 'active' ? 'success' : 'default'}>
                                        {course.status === 'active' ? 'Đang mở' : 'Đã đóng'}
                                    </Tag>
                                </Space>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Empty description="Chưa có khóa học nào" />
            )}
        </div>
    );
}

export default CourseManagement;