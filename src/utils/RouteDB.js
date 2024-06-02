import { useParams } from 'react-router-dom';

const useRouteDB = () => {
  const { dataBase } = useParams();

  const params = (param) => {
    if (dataBase) return `/${dataBase}${param}`;

    return `/${param}`;
  };

  return { params };
};

export default useRouteDB;
