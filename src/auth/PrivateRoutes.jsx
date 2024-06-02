import { useContext, useEffect } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';

import { UserContext } from '../context';

export const PrivateRoutes = () => {
  const { state, dispatch } = useContext(UserContext);
  const { dataBase } = useParams();

  useEffect(() => {
    if (state?.userInfo.company !== dataBase) {
      dispatch({ type: 'LOG_OUT' });
    }
  }, [dataBase]);

  return state.userInfo.token ? <Outlet /> : <Navigate to={`/${dataBase}`} />;
};
