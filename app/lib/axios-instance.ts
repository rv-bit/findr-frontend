import axios from "axios";

const axiosInstance = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true });
axiosInstance.interceptors.request.use(
	(config) => {
		if (config.url && config.url.startsWith("/api/")) {
			config.url = config.url.replace("/api/", "/");
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

export default axiosInstance;
