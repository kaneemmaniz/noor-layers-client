import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://ecommerce-pecw.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// REQUEST: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("noor_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("📤 [API] →", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE: unwrap { success, message, data, errors }
api.interceptors.response.use(
  (response) => {
    console.log("📥 [API] ←", response.config.url, response.data);

    if (response.data && typeof response.data === "object" && "success" in response.data) {
      if (response.data.success === false) {
        return Promise.reject({
          response: {
            data: {
              message: response.data.message || "Request failed",
              errors: response.data.errors,
            },
            status: response.status,
          },
        });
      }
      response.data = response.data.data;
      console.log("📥 [API] Unwrapped:", response.data);
    }
    return response;
  },
  (error) => {
    console.log("📥 [API] ✗ Error:", error.response?.status, error.response?.data);

    if (error.response?.status === 401) {
      localStorage.removeItem("noor_token");
      localStorage.removeItem("noor_user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;