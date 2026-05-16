import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Tabs, Card, Button, List, Tag, Space, Breadcrumb, Empty, Collapse, Modal, message } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, FileTextOutlined, TrophyOutlined, LinkOutlined } from '@ant-design/icons';
import axios from 'axios';
import ModalAddLesson from './modal/modalAddLesson';
import ModalEditLesson from './modal/modalEditLesson';

const { Title, Text, Paragraph } = Typography;

const CourseDetail: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);

  // Các trạng thái quản lý Modal xem tài liệu
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const getLessons = useCallback(async () => {
    try {
      const res = await axios.get(`/api/lessons/${courseId}`);
      setLessons(res.data);
    } catch (err) {
      console.error("Lỗi tải bài giảng:", err);
    }
  }, [courseId]);

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

  // Hàm kích hoạt mở Modal hiển thị nội dung file vật lý (.pdf, .png, ...)
  const handleOpenPreview = (title: string, filePath: string) => {
    setPreviewTitle(title);

    if (filePath) {
      const fullUrl = filePath.startsWith('http') ? filePath : `/uploads${filePath.startsWith('/') ? filePath : '/' + filePath}`;
      setPreviewUrl(fullUrl);
      setIsPreviewOpen(true);
    } else {
      message.warning("Bài học này không có tệp đính kèm vật lý.");
    }
  };

  // Hàm render nội dung chi tiết bài học bên trong Collapse
  const renderLessonContent = (lesson: any) => {
    // 1. Khôi phục mảng danh sách File vật lý từ chuỗi JSON văn bản
    let fileList: string[] = [];
    if (lesson.file) {
      try { fileList = JSON.parse(lesson.file); } catch (e) { fileList = [lesson.file]; }
    }

    // 2. Khôi phục mảng danh sách Link và Nhãn Link từ chuỗi JSON văn bản
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
        {/* Hiển thị đoạn văn bản tóm tắt nội dung bài học */}
        {lesson.content && (
          <Paragraph style={{ whiteSpace: 'pre-wrap', fontSize: '14px', marginBottom: '16px' }}>
            {lesson.content}
          </Paragraph>
        )}

        {/* KHỐI 1: HIỂN THỊ DANH SÁCH CÁC CARD ĐƯỜNG DẪN ĐÍNH KÈM (LINK DRIVE/WEB) */}
        {urlList.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>Liên kết tài nguyên học tập ({urlList.length}):</Text>
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

        {/* KHỐI 2: HIỂN THỊ DANH SÁCH CÁC NÚT FILE VẬT LÝ (BẤM MỞ MODAL PREVIEW) */}
        {fileList.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>Tệp tin đính kèm từ hệ thống ({fileList.length}):</Text>
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
        <>
  
            <Button
              type="primary"
              onClick={() => setIsModalOpen(true)}
              icon={<PlusOutlined />}
              style={{ marginBottom: 16 }}
            >
              Đăng nội dung mới
            </Button>


          <Card
          >
            {lessons.map((lesson: any, index: number) => (
              <Collapse
                key={lesson.id || index}
                style={{ marginBottom: '12px',}}
                items={[{
                  key: lesson.id,
                  label: <Text strong style={{display: "flex", justifyContent: "space-between"}}>{`${lesson.title}`} <a onClick={() => { setIsEditModalOpen(true); setEditingLesson(lesson); }} style={{display: "flex", justifyContent: "space-between"}}>Chỉnh sửa</a></Text>,
                  children: renderLessonContent(lesson)
                }]}
              />
            ))}
            {lessons.length === 0 && <Empty description="Chưa có nội dung bài học nào." />}
          </Card>
        </>
      ),
    },
    {
      key: '2',
      label: 'Bài tập (Assignments)',
      children: (
        <Card bordered={false}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <Text strong>Danh sách bài tập nộp</Text>
            {<Button icon={<PlusOutlined />}>Tạo bài tập mới</Button>}
          </div>
          <List locale={{ emptyText: <Empty description="Chưa có bài tập nào được giao" /> }} />
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
        <Breadcrumb.Item><a href="#" onClick={(e) => { e.preventDefault(); navigate(-1); }}><ArrowLeftOutlined /> Quay lại</a></Breadcrumb.Item>
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

      {/* MODAL TRÌNH XEM FILE TOÀN MÀN HÌNH */}
      <Modal
        title={<span style={{ fontSize: '16px', fontWeight: 'bold' }}>Đang xem tệp tin: {previewTitle}</span>}
        open={isPreviewOpen}
        onCancel={() => { setIsPreviewOpen(false); setPreviewUrl(''); }}
        footer={[
          <Button key="close" onClick={() => { setIsPreviewOpen(false); setPreviewUrl(''); }}>
            Đóng cửa sổ
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
            title="Lesson File Preview Content"
            allowFullScreen
          />
        ) : (
          <div style={{ padding: '24px', textAlign: 'center' }}>Không thể hiển thị nội dung tệp tin.</div>
        )}
      </Modal>

      <ModalAddLesson
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          message.success("Nội dung mới đã được đăng thành công!");
          getLessons();
        }}
        course_ID={courseId}
      />
      <ModalEditLesson
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          setIsEditModalOpen(false);
          message.success("Nội dung bài học đã được cập nhật thành công!");
          getLessons();
        }}
        lessonData={editingLesson}
      />
    </div>
  );
};

export default CourseDetail;