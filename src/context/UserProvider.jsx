/* eslint-disable react/prop-types */
import axios from 'axios';
import { useReducer } from 'react';
import { createContext } from 'react';

export const UserContext = createContext();

// MiReducer.js
const initialState = {
  userInfo: JSON.parse(localStorage.getItem('user')) || {},
};

axios.defaults.headers.common[
  'Authorization'
] = `Bearer ${initialState.userInfo.token}`;

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const reducer = (state, action) => {
  switch (action.type) {
    case 'LOG_IN':
      localStorage.setItem('user', JSON.stringify(action.payload));

      // Colocando token globalmente
      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${action.payload.token}`;

      return { ...state, userInfo: { ...action.payload } };

    case 'LOG_OUT':
      localStorage.removeItem('user');

      // Removiendo token globalmente
      axios.defaults.headers.common['Authorization'] = null;

      return { ...state, userInfo: {} };

    default:
      return state;
  }
};

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  console.log(state);
  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};
