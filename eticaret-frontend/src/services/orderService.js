import axiosClient from "../api/axiosClient";

const orderService = {

    getByUser: (userId) => {
        return axiosClient.get(`/Orders/GetByUser/${userId}`);
    },

    getDetail: (id) => {
        return axiosClient.get(`/Orders/GetDetail/${id}`);
    },

    create: (orderData) => {
        return axiosClient.post("/Orders/Create",orderData);
    },

    updateStatus: (id,status) => {
        return axiosClient.put(`/Orders/UpdateStatus/${id}`,status);
    },
};

export default orderService;