import axiosClient from "../api/axiosClient";

const productService ={

    getAll:(categoryId =null) => {
        const params = categoryId ? {category: categoryId} : {};
        return axiosClient.get("/Products/GetAll", {params});
    },

    getAllForAdmin: () => {
        return axiosClient.get("/Products/GetAllForAdmin");
    },
    
    getById: (id) => {
        return axiosClient.get(`/Products/GetById/${id}`);
    },

    create: (productData) => {
        return axiosClient.post("/Products/Create",productData);
    },
    
    update: (id,productData) => {
        return axiosClient.put(`/Products/Update/${id}`,productData);
    },

    delete: (id) => {
        return axiosClient.delete(`/Products/Delete/${id}`);
    },

    toggleActive: (id) => {
        return axiosClient.patch(`/Products/ToggleActive/${id}`);
    },
};

export default productService;