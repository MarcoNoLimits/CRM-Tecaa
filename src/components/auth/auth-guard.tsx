import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';

export function AuthGuard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-primary">
        <div className="animate-pulse text-text-tertiary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
