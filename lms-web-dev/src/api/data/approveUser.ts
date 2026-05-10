export const approveUser = async (userId: number) => {
    const response = await fetch("http://localhost:5000/api/users/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }), // Gửi đúng trường 'id' mà backend đang đợi
    });
    return response.json();
};