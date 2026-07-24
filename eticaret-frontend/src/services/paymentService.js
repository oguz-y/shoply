import axiosClient from "../api/axiosClient";

const paymentService = {
    initiate: (data) => {
        return axiosClient.post("/Payment/Initiate", data);
    },
};

export default paymentService;