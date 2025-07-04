import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = "http://192.168.1.12:3002/V1/";
//const BASE_URL = "https://wemgo.online/wemgo/";



const config = async () => {
  try {
    const authToken = await AsyncStorage.getItem('authToken');

    if (authToken) {
      return {
        headers: {
          Authorization: authToken ? `Bearer ${authToken}` : '',
          'Content-Type': 'application/json',
        },
      };
    }

    return {
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.error('Error retrieving authToken:', error);
    return {
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};

export const loginHttps = async ({email, password}) => {

  try {
    return await axios.post(BASE_URL + 'auth', {
      email,
      password,
    });
  } catch (error) {
    throw error;
  }
};

export const postHttps = async (url, body) => {


  const authToken = await AsyncStorage.getItem('authToken');
  try {
    return await axios.post(BASE_URL + url, body, {
      headers: {
        Authorization: authToken ? `Bearer ${authToken}` : '',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    throw error;
  }
};


export const postHttpsStories = async (url, body) => {
  

  const authToken = await AsyncStorage.getItem('authToken');
  try {
    return await axios.post(BASE_URL + url, body, {
      headers: {
        Authorization: authToken ? `Bearer ${authToken}` : '',
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error) {
    throw error;
  }
};

export const postRegister = async (url, body) => {
  
  try {
 
    return await axios.post(BASE_URL + url, body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error) {
    throw error;
  }
};

export const patchHttps = async (url, body) => {

  const authToken = await AsyncStorage.getItem('authToken');
  try {
    return await axios.patch(BASE_URL + url, body, {
      headers: {
        Authorization: authToken ? `Bearer ${authToken}` : '',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    throw error;
  }
};


export const patchHttpsStories = async (url, body) => {
  const authToken = await AsyncStorage.getItem('authToken');
  try {

    return await axios.patch(BASE_URL + url, body, {
      headers: {
        Authorization: authToken ? `Bearer ${authToken}` : '',
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error) {
    console.log(error)
    throw error;
  }
};

export const deleteHttps = async (url) => {
  

  try {
    return await axios.delete(BASE_URL + url, config());
  } catch (error) {
    throw error;
  }
};

export const getHttps = async (url, params) => {


  try {
    const authToken = await AsyncStorage.getItem('authToken');

    return await axios.get(BASE_URL + url, {
      headers: {
        Authorization: authToken ? `Bearer ${authToken}` : '',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    if (error.status) {

      //aqui es donde recibe
    }
    throw error;
  }
};
