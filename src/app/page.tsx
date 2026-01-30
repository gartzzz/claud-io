'use client';

/**
 * Root page redirects to the app layout with dashboard
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout';
import DashboardPage from './(app)/page';

export default function Home() {
  // Render the dashboard directly within the AppLayout
  return (
    <AppLayout>
      <DashboardPage />
    </AppLayout>
  );
}
