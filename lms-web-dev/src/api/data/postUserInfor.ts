export const createUser = async (userData: any) => {
    try {
        const response = await fetch("http://localhost:5000/users", { // Đảm bảo là /users
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        // Nếu lỗi 500, đoạn này sẽ lấy tin nhắn lỗi từ MySQL gửi về
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Lỗi hệ thống Server");
        }

        return await response.json();
    } catch (error) {
        console.error("Lỗi API:", error);
        throw error;
    }
};