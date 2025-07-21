import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getProfile } from '@/services/api';
import Loader from '@/components/Loader';

export default function ProtectedRoute() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'ok' | 'unauth'
  const loc = useLocation();

  useEffect(() => {
    getProfile()
      .then(() => setStatus('ok'))
      .catch(err => {
        if (err.message.includes('401')) {
          localStorage.removeItem('token');
          setStatus('unauth');
        } else {
          console.error(err);
          setStatus('unauth');
        }
      });
  }, [loc.pathname]);

  if (status === 'loading') {
    return <Loader />;
  }
  if (status === 'unauth') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}