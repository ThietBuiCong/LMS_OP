import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { fetchUsers } from '../api/data/getUserInfor'; // Đường dẫn đến file gọi API của bạn
import { deleteUser } from '../api/data/deleteUserInfor'; // Đường dẫn đến file gọi API của bạn

export const useUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchUsers();
            setUsers(data);
        } catch (error) {
            message.error("Không thể tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleDelete = async (id: string) => {
        try {
            await deleteUser(id);
            message.success("Xóa thành công");
            loadUsers(); // Refresh lại danh sách
        } catch (error) {
            message.error("Không thể xóa người dùng");
        }
    };

    // Các hàm xử lý Search/Reset
    const handleSearch = (selectedKeys: string[], confirm: any, dataIndex: any) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText('');
    };

    // Trả về các biến và hàm để Component sử dụng
    return {
        users,
        loading,
        searchText,
        searchedColumn,
        handleDelete,
        handleSearch,
        handleReset,
        loadUsers
    };
};