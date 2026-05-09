// Xóa user
export const deleteUser = async (id: number) => {
    const response = await fetch(`http://localhost:5000/users/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Xóa thất bại");
    return await response.json();
};