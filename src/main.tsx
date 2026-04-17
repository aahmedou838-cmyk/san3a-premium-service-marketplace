import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { convex } from '@/lib/convex';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { ClientDashboard } from '@/pages/client/ClientDashboard'
import { WorkerDashboard } from '@/pages/worker/WorkerDashboard'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { RtlLayout } from '@/components/layout/RtlLayout'
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    element: <RtlLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/client", element: <ClientDashboard /> },
      { path: "/worker", element: <WorkerDashboard /> },
      { path: "/admin", element: <AdminDashboard /> },
    ],
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ConvexAuthProvider client={convex}>
          <RouterProvider router={router} />
        </ConvexAuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)