// getUserInfor.ts
import axios from 'axios';
export const fetchUsers = async () => {
   const res = await axios.get('/users'); // Tuyệt vời! Nó sẽ tự ghép với baseURL
   return res.data;
}