const axios = require('axios');
const fs = require('fs');

const GetData = async (url, params = {}) => {
    return axios
      .get(url, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        params: params
      })
      .then(response => response)
      .catch(error => error);
  };
  const PutData = async (url, data = {}) => {
    return axios
      .put(url, data, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      })
      .then(response => response)
      .catch(error => error);
  };

const PostData = async (url, data) => {
  return axios
    .post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
    .then(response => response)
    .catch(response => response);
};

const sendAudioMessage = async (url,audio ) => {
    try {

      const response = await axios.post(url, audio, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      console.log(response.data);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error al enviar el mensaje:', error.message);
      } else {
        console.error('Error desconocido al enviar el mensaje');
      }
    }
  };

module.exports = {
  GetData,
  PostData,
  PutData,
  sendAudioMessage,
};