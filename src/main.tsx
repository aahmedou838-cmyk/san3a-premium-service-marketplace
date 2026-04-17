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
import { LiveTracking } from '@/pages/client/LiveTracking'
import { OrderHistory } from '@/pages/client/OrderHistory'
import { WorkerDashboard } from '@/pages/worker/WorkerDashboard'
import { WorkerKYC } from '@/pages/worker/WorkerKYC'
import { ActiveJob } from '@/pages/worker/ActiveJob'
import { WalletPage } from '@/pages/worker/WalletPage'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { ProfilePage } from '@/pages/shared/ProfilePage'
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
      { path: "/client/track/:requestId", element: <LiveTracking /> },
      { path: "/orders", element: <OrderHistory /> },
      { path: "/worker", element: <WorkerDashboard /> },
      { path: "/worker/kyc", element: <WorkerKYC /> },
      { path: "/worker/job/:requestId", element: <ActiveJob /> },
      { path: "/wallet", element: <WalletPage /> },
      { path: "/admin", element: <AdminDashboard /> },
      { path: "/profile", element: <ProfilePage /> },
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