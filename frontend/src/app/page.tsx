'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { api } from '@/lib/api';
import Overview from '@/components/Overview';
import Analytics from '@/components/Analytics';
import BookingsTable from '@/components/BookingsTable';
import MechanicsList from '@/components/MechanicsList';
import { ThemeToggle } from '@/components/ThemeToggle';
import MechanicsMap from '@/components/MechanicsMap';
import ManagementTab from '@/components/ManagementTab';

// Empty io() tells Socket.io to connect to the current domain.
// Next.js will automatically proxy the connection to AWS!
const socket = io();

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'management'>('dashboard');

  const fetchData = async () => {
    try {
      const [dashRes, analyticsRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/analytics')
      ]);
      setDashboardData(dashRes.data);
      setAnalyticsData(analyticsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();

    socket.on('bookingStatusChanged', () => {
      fetchData(); // Refresh data on booking update
    });

    return () => {
      socket.off('bookingStatusChanged');
    };
  }, []);

  if (!dashboardData || !analyticsData) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex-col md:flex">
      <div className="border-b bg-white dark:bg-zinc-950">
        <div className="flex h-16 items-center px-4 justify-between">
          <div className="flex items-center">
            <img src="/logo.png" alt="Instant Mechanic Logo" className="h-10 mr-4" />
            <h2 className="text-xl font-bold tracking-tight text-orange-500">Live Dashboard</h2>
          </div>
          <div className="flex items-center space-x-6">
             <div className="flex space-x-4">
                <button 
                  onClick={() => setActiveTab('dashboard')} 
                  className={`text-sm font-medium ${activeTab === 'dashboard' ? 'text-orange-500 underline underline-offset-4' : 'text-muted-foreground'}`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setActiveTab('management')} 
                  className={`text-sm font-medium ${activeTab === 'management' ? 'text-orange-500 underline underline-offset-4' : 'text-muted-foreground'}`}
                >
                  Management
                </button>
             </div>
             <ThemeToggle />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 dark:bg-zinc-900 min-h-screen">
        
        {activeTab === 'dashboard' ? (
          <>
            <div className="w-full">
              <MechanicsMap />
            </div>
            
            <Overview data={dashboardData} />
            <Analytics data={analyticsData} />
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <div className="col-span-4 space-y-4">
                <BookingsTable />
              </div>
              <div className="col-span-3 space-y-4">
                <MechanicsList />
              </div>
            </div>
          </>
        ) : (
          <ManagementTab />
        )}

      </div>
    </div>
  );
}
