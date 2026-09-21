// ไฟล์: toolsbox-frontend/lib/api-client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api/v1', 
  timeout: 30000, 
});

apiClient.interceptors.request.use((config) => {
  config.headers['X-User-Id'] = 'test-user-123';
  config.headers['X-Layer1-Role'] = 'STUDENT';
  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 🚀 ปิดบรรทัดนี้ทิ้งไป (ใส่คอมเมนต์) เพื่อป้องกันไม่ให้ Next.js เด้งหน้าจอดำ Error Overlay ในโหมด Dev
    // console.error('API Error:', error.response?.data || error.message);
    
    return Promise.reject(error);
  }
);