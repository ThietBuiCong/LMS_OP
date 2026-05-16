import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Tabs, Card, Button, List, Tag, Space, Breadcrumb, Empty, Collapse, Modal, message } from 'antd';
import { ArrowLeftOutlined, FileTextOutlined, TrophyOutlined, LinkOutlined } from '@ant-design/icons';
import axios from 'axios';
const { Title, Text, Paragraph } = Typography;

const CourseDetailForStudent: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]); // Khai báo state lưu danh sách bài học
  const [loading, setLoading] = useState(true);

  // Các trạng thái quản lý Modal xem tài liệu trực tiếp cho sinh viên
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  // Hàm gọi API lấy danh sách bài học của khóa học
  const getLessons = useCallback(async () => {
    try {
      const res = await axios.get(`/api/lessons/${courseId}`);
      setLessons(res.data);
    } catch (err) {
      console.error("Lỗi tải bài giảng:", err);
      message.error("Không thể tải danh sách bài học.");
    }
  }, [courseId]);

  // Đồng bộ tải dữ liệu chi tiết môn học và danh mục bài học
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`/api/courses/detail/${courseId}`);
        setCourseInfo(res.data);
      } catch (err) {
        console.error("Lỗi tải chi tiết khóa học:", err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchDetail();
      getLessons();
    }
  }, [courseId, getLessons]);

  // Hàm mở Modal xem file vật lý (.pdf, hình ảnh...)
  const handleOpenPreview = (title: string, filePath: string) => {
    setPreviewTitle(title);
    if (filePath) {
      const fullUrl = filePath.startsWith('http') ? filePath : `/uploads${filePath.startsWith('/') ? filePath : '/' + filePath}`;
      setPreviewUrl(fullUrl);
      setIsPreviewOpen(true);
    } else {
      message.warning("Tệp tin này không khả dụng.");
    }
  };

  // Hàm phân tách dữ liệu JSON và hiển thị nội dung bài học khi sinh viên click mở rộng
  const renderLessonContent = (lesson: any) => {
    // Giải mã mảng file vật lý
    let fileList: string[] = [];
    if (lesson.file) {
      try { fileList = JSON.parse(lesson.file); } catch (e) { fileList = [lesson.file]; }
    }

    // Giải mã mảng liên kết link tài liệu
    let urlList: string[] = [];
    let labelList: string[] = [];
    if (lesson.link) {
      try { urlList = JSON.parse(lesson.link); } catch (e) { urlList = [lesson.link]; }
    }
    if (lesson.link_label) {
      try { labelList = JSON.parse(lesson.link_label); } catch (e) { labelList = [lesson.link_label]; }
    }

    return (
      <div style={{ padding: '10px' }}>
        {/* Hiển thị nội dung mô tả bằng chữ */}
        {lesson.content && (
          <Paragraph style={{ whiteSpace: 'pre-wrap', fontSize: '14px', marginBottom: '16px', color: '#333' }}>
            {lesson.content}
          </Paragraph>
        )}

        {/* Khối danh sách các liên kết ngoài (Drive, Github, tài liệu đọc thêm...) */}
        {urlList.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <Text type="secondary" strong style={{ display: 'block', marginBottom: '8px' }}>Liên kết tài nguyên ({urlList.length}):</Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {urlList.map((urlPath, index) => (
                <Card
                  key={index}
                  size="small"
                  style={{ backgroundColor: '#fafafa' }}
                  actions={[
                    <Button type="link" size="small" icon={<LinkOutlined />} href={urlPath} target="_blank" rel="noopener noreferrer">
                      Mở liên kết
                    </Button>
                  ]}
                >
                  <Card.Meta
                    title={labelList[index] || `Liên kết tham khảo ${index + 1}`}
                    description={<Text type="secondary" ellipsis style={{ fontSize: '12px' }}>{urlPath}</Text>}
                  />
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Khối danh sách các file vật lý lưu trên hệ thống backend */}
        {fileList.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <Text type="secondary" strong style={{ display: 'block', marginBottom: '8px' }}>Tệp tin đính kèm ({fileList.length}):</Text>
            <Space wrap>
              {fileList.map((filePath, fileIndex) => {
                const fileName = filePath.split('/').pop() || `Tài liệu đính kèm ${fileIndex + 1}`;
                return (
                  <Button
                    key={fileIndex}
                    type="primary"
                    ghost
                    icon={<FileTextOutlined />}
                    onClick={() => handleOpenPreview(`${lesson.title} - Tệp ${fileIndex + 1}`, filePath)}
                  >
                    {fileName.length > 25 ? `${fileName.substring(0, 22)}...` : fileName}
                  </Button>
                );
              })}
            </Space>
          </div>
        )}
      </div>
    );
  };

  const items = [
    {
      key: '1',
      label: 'Khóa học (Course)',
      children: (
        <Card>
          {lessons.map((lesson: any, index: number) => (
            <Collapse
              key={lesson.id || index}
              style={{ marginBottom: '12px' }}
              items={[{
                key: lesson.id,
                // Đã dọn dẹp: Loại bỏ hoàn toàn chức năng "Chỉnh sửa" dành riêng cho giảng viên
                label: <Text strong>{`[Mục ${lesson.order_index || index + 1}] - ${lesson.title}`}</Text>,
                children: renderLessonContent(lesson)
              }]}
            />
          ))}
          {lessons.length === 0 && <Empty description="Chưa có nội dung bài học nào được đăng cho lớp học này." />}
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
          </div>
          <List
            dataSource={[]} 
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
      children: <Card><TrophyOutlined /> Chức năng luyện thi đang phát triển...</Card>
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

      {/* MODAL XEM CHI TIẾT TÀI LIỆU DÀNH CHO SINH VIÊN */}
      <Modal
        title={<span style={{ fontSize: '16px', fontWeight: 'bold' }}>Đang xem tài liệu: {previewTitle}</span>}
        open={isPreviewOpen}
        onCancel={() => { setIsPreviewOpen(false); setPreviewUrl(''); }}
        footer={[
          <Button key="close" onClick={() => { setIsPreviewOpen(false); setPreviewUrl(''); }}>
            Đóng lại
          </Button>,
          <Button key="download" type="primary" href={previewUrl} target="_blank" rel="noopener noreferrer">
            Tải về máy ↗
          </Button>
        ]}
        width={1000}
        centered
        bodyStyle={{ padding: 0, height: '70vh' }}
      >
        {previewUrl ? (
          <iframe
            src={previewUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Student Lesson File Preview Content"
            allowFullScreen
          />
        ) : (
          <div style={{ padding: '24px', textAlign: 'center' }}>Không thể hiển thị tệp tin.</div>
        )}
      </Modal>
    </div>
  );
};

export default CourseDetailForStudent;