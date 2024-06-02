import { useContext } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';

import { UserContext } from '../context';

export const PublicRoutes = () => {
  const { state } = useContext(UserContext);
  const { dataBase } = useParams();

  return state.userInfo.token ? (
    <Navigate to={`/${dataBase || ''}/home`} />
  ) : (
    <Outlet />
  );
};
