import axiosClient from "../api/axiosClient";

const authService = {

    register: (userData) => {
        return axiosClient.post("/Users/Register", userData);
    },

    login: (credentials) => {
        return axiosClient.post("/Users/Login", credentials).then((response) => {
            const token = response?.data?.token;

            if (token) {
                localStorage.setItem("token", token);
            }

            return response;
        });
    },

    logout: () => {
        localStorage.removeItem("token");
    },

    getProfile: () => {
        return axiosClient.get("/Users/Profile");
    },
};

export default authService;