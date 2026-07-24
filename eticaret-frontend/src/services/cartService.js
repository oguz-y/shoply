import axiosClient from "../api/axiosClient";

const cartService = {

    getByUser: (userId) => {
        return axiosClient.get(`/Cart/GetByUser${userId}`);
    },
    
    addToCart: (cartItemData) => {
        return axiosClient.post("/Cart/AddToCart",cartItemData);
    },

    updateQuantity: (id,quantity) => {
        return axiosClient.put(`/Cart/UpdateQuantity/${id}`,quantity, {
            headers: {"Content-Type": "application/json"},
        });
    },

    removeFromCart: (id) => {
        return axiosClient.delete(`/Cart/RemoveFromCart/${id}`);
    },
};

export default cartService;