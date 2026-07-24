import axiosClient from "../api/axiosClient";

const reviewService = {

    getByProduct: (productId) => {
        return axiosClient.get(`/Reviews/GetByProduct/${productId}`);
    },

    create: (reviewData) => {
        return axiosClient.post("/Reviews/Create",reviewData);
    },

    delete: (id) => {
        return axiosClient.delete(`/Reviews/Delete/${id}`);
    },
};

export default reviewService;