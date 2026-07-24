import axios from "axios";
import axiosClient from "../api/axiosClient";

const addressService = {

    getByUser: (userId) => {
        return axiosClient.get(`Addresses/GetByUser/${userId}`);
    },

    create: (addressData) => {
        return axiosClient.post("/Addresses/Create",addressData);
    },

    update: (id,addressData) => {
        return axiosClient.put(`/Addresses/Update/${id}`,addressData);
    },

    delete: (id) => {
        return axiosClient.delete(`/Addresses/Delete/${id}`);
    },
};

export default addressService;