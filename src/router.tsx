import { createBrowserRouter } from 'react-router-dom';

import { Layout } from 'src/components/layout';
import { HomePage, SeasonPage, AboutPage, NotFoundPage } from 'src/pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: ':year',
        element: <SeasonPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
