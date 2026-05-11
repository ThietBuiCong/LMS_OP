export const fetchUsers = async () => {
  try {
    const response = await fetch('http://localhost:5000/users');
    
    if (!response.ok) {
      // Lấy chi tiết lỗi từ server trả về
      const errorData = await response.json();
      console.error("Server Error:", errorData);
      throw new Error(errorData.error || 'Fetch users failed');
    }

    return await response.json();
  } catch (error) {
    console.error("Network Error:", error);
    throw error;
  }
};