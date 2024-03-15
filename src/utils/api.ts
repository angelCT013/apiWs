import axios from 'axios';

export const GetData = async (url: string, params: any = {}) => {
    try {
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            params: params
        });
        return response.data;
    } catch (error) {
        return error;
    }
};

export const PutData = async (url: string, data: any = {}) => {
    try {
        const response = await axios.put(url, data, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        return error;
    }
};

export const PostData = async (url: string, data: any) => {
    try {
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        return error;
    }
};
