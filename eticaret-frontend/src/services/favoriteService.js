import axiosClient from "../api/axiosClient";

const favoriteService = {
    getByUser: (userId) => {
        return axiosClient.get(`/Favorites/GetByUser/${userId}`);
    },
    add: (data) => {
        return axiosClient.post("/Favorites/Add", data);
    },
    remove: (userId, productId) => {
        return axiosClient.delete(`/Favorites/Remove?userId=${userId}&productId=${productId}`);
    },
};

export default favoriteService;
