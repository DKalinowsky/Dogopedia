import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://172.31.37.94:5000', 
});

export default instance;