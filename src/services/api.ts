import axios from 'axios';

export const api = axios.create({
    baseURL: '/api',
});

/* Como a url da api é a mesma do front 
o axios vai aproveitar a url já existente que nesse caso 
é a http://localhost:3000 e colocar o /api depois desse endereço */