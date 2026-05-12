import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Tabs, Card, Button, List, Tag, Space, Breadcrumb, Empty } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, FileTextOutlined, NotificationOutlined, TrophyOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const CourseDetail: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`/api/courses/detail/${courseId}`);
        setCourseInfo(res.data);
      } catch (err) {
        console.error("Lỗi tải chi tiết:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [courseId]);

  const items = [
    {
      key: '1',
      label: 'Khóa học (Course)',
      children: (
        <Card bordered={false} >
          <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }}>Đăng nội dung mới
          </Button>
          <List
            itemLayout="horizontal"
            dataSource={[]} // Load từ API
            renderItem={() => null}
            locale={{ emptyText: <Empty description="Chưa có nội dung nào" /> }}
          />
        </Card>
      ),
    },
    {
      key: '2',
      label: 'Bài tập (Assignments)',
      children: (
        <Card bordered={false}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <Text strong>Danh sách bài tập nộp</Text>
            <Button icon={<PlusOutlined />}>Tạo bài tập mới</Button>
          </div>
          <List
            dataSource={[]} // Dữ liệu bài tập nộp
            renderItem={(item: any) => (
              <List.Item actions={[<Button type="link">Xem bài nộp</Button>]}>
                <List.Item.Meta
                  avatar={<FileTextOutlined style={{ fontSize: 24 }} />}
                  title={item.title}
                  description={`Hạn nộp: ${item.deadline}`}
                />
              </List.Item>
            )}
            locale={{ emptyText: <Empty description="Chưa có bài tập nào được giao" /> }}
          />
        </Card>
      ),
    },
    {
        key: '3',
        label: 'Kỳ thi',
        children: <Card style={{ border: '2px solid #000' }}><TrophyOutlined /> Chức năng luyện thi đang phát triển...</Card>
    }
  ];

  if (loading) return <div>Đang tải...</div>;

  return (
    <div style={{ padding: '24px' }}>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item><a onClick={() => navigate(-1)}><ArrowLeftOutlined /> Quay lại</a></Breadcrumb.Item>
        <Breadcrumb.Item>Khóa học</Breadcrumb.Item>
        <Breadcrumb.Item>{courseInfo?.course_code}</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ marginBottom: 24 }}>
        <Title level={2}>{courseInfo?.course_name || "Tên khóa học"}</Title>
        <Space>
          <Tag color="black">{courseInfo?.course_code}</Tag>
          <Text type="secondary">ID lớp: {courseId}</Text>
        </Space>
      </div>

      <Tabs defaultActiveKey="1" items={items} size="large" />
    </div>
  );
};

export default CourseDetail;