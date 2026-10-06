import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { Layout } from 'src/components/layout';
import { RouteFallback } from 'src/components/common';

const HomePage = lazy(() => import('src/pages').then((module) => ({ default: module.HomePage })));
const SeasonPage = lazy(() =>
  import('src/pages').then((module) => ({ default: module.SeasonPage }))
);
const AboutPage = lazy(() => import('src/pages').then((module) => ({ default: module.AboutPage })));
const NotFoundPage = lazy(() =>
  import('src/pages').then((module) => ({ default: module.NotFoundPage }))
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<RouteFallback />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: ':year',
        element: (
          <Suspense fallback={<RouteFallback />}>
            <SeasonPage />
          </Suspense>
        ),
      },
      {
        path: 'about',
        element: (
          <Suspense fallback={<RouteFallback />}>
            <AboutPage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<RouteFallback />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },
]);
