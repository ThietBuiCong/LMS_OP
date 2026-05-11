import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '0.15m', target: 100 }, // Tăng vọt lên 100 người dùng cùng lúc
    { duration: '0.15m', target: 100 }, 
    { duration: '0.15m', target: 50 },
  ],
};

export default function () {
  const url = 'http://localhost:5000/login'; // Thay bằng URL login của bạn
  const payload = JSON.stringify({
    email: 'skygenshin12@gmail.com', // Dùng 1 email có thật trong 200 user bạn đã seed
    password: '12345',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  // Kiểm tra xem phản hồi có phải là 200 (OK) không
  check(res, {
    'is status 200': (r) => r.status === 200,
    'transaction time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1); // Mỗi người dùng ảo sẽ đợi 1 giây trước khi thử lại (giống người thật)
}