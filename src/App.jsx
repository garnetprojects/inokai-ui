import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LogIn from './pages/LogIn';
import Home from './pages/Home';
import EmpresasPage from './pages/EmpresasPage';
import { PublicRoutes } from './auth/PublicRoutes';
import { PrivateRoutes } from './auth/PrivateRoutes';

import PagesLayout from './Layout/PagesLayout';
import EmpresaEditPage from './pages/EmpresaEditPage';
import EmpleadosPage from './pages/EmpleadosPage';
import ThemeApp from '../theme/ThemeApp';
import Horarios from './pages/Horarios';

const router = createBrowserRouter([
  {
    path: '/:dataBase?',
    element: <ThemeApp />,
    children: [
      {
        element: <PublicRoutes />,
        children: [
          {
            path: '',
            element: <LogIn />,
          },
        ],
      },
      {
        element: <PrivateRoutes />,
        children: [
          {
            element: <PagesLayout />,
            children: [
              {
                path: 'home',
                element: <Home />,
              },
              {
                path: 'empresas',
                element: <EmpresasPage />,
              },
              {
                path: 'empresas/:nombreEmpresa',
                element: <EmpresaEditPage />,
              },

              {
                path: 'empleados',
                element: <EmpleadosPage />,
              },
              {
                path: 'horarios',
                element: <Horarios />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
