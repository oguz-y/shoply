import axiosClient from "../api/axiosClient";

const categoryService ={
    getAll: () => {
        return axiosClient.get("/Categories/GetAll");
    },
    getAllForAdmin: () => {
        return axiosClient.get("/Categories/GetAllForAdmin");
    },

    create: (categoryData) => {
        return axiosClient.post("/Categories/Create",categoryData);
    },
    update: (id , categoryData) => {
        return axiosClient.put(`/Categories/Update/${id}`, categoryData);
    },

    delete: (id) => {
        return axiosClient.delete(`/Categories/Delete/${id}`);
    },

    toggleActive: (id) => {
        return axiosClient.patch(`/Categories/ToggleActive/${id}`);
    },
};

export default categoryService;