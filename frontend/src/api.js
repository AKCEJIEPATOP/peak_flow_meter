import axios from 'axios';

const PROTOCOL = 'http';
const IP = 'localhost';
const PORT = '8000';
const BASE_URL = `${PROTOCOL}://${IP}:${PORT}/`;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 1000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (config.baseURL === BASE_URL && !config.headers.Authorization) {
      const token = localStorage.getItem('token');

      if (token) {
        // eslint-disable-next-line no-param-reassign
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

const API = {
  User: {
    logIn: (username, password) => {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      return axiosInstance.post('/user/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },

    register: (username, password) => axiosInstance.post(`/user/register`, { username, password }),

    getSelfInfo: () => axiosInstance.get('/user/get_self_info'),

    addMeasurement: (value) => axiosInstance.post(`/user/add_measurement?value=${value}`),
  },
};

export default API;
