import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LogIn from './pages/LogIn';
import Home from './pages/Home';
import EmpresasPage from './pages/EmpresasPage';
import { PublicRoutes } from './auth/PublicRoutes';
import { PrivateRoutes } from './auth/PrivateRoutes';

import PagesLayout from './Layout/PagesLayout';
import EmpresaEditPage from './pages/EmpresaEditPage';
import EmpleadosPage from './pages/EmpleadosPage';
import ContactsPage from './pages/ContactsPage';

import ThemeApp from '../theme/ThemeApp';
import Horarios from './pages/Horarios';
import React, { useEffect } from 'react'; // Importa React y useEffect

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
              {
                path: 'agenda',
                element: <ContactsPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

function App() {
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Verifica si es la hora y minuto exacto para recargar
      if (hours === 12 && minutes ===40) {
        alert("La página se está recargando para mostrar las últimas actualizaciones.");
        window.location.reload();
      }
    };

    // Verifica cada minuto
    const interval = setInterval(checkTime, 60000);
    
    return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
