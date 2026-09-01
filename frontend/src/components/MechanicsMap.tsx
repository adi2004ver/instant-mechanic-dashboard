'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import 'leaflet/dist/leaflet.css';

// Dynamically import Map component to avoid SSR issues
const Map = dynamic(
  () => import('./MapComponent'),
  { ssr: false }
);

export default function MechanicsMap() {
  const [mechanics, setMechanics] = useState<any[]>([]);

  useEffect(() => {
    const fetchMechanics = async () => {
      try {
        const res = await api.get('/mechanics');
        setMechanics(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMechanics();
  }, []);

  return (
    <Card className="w-full shadow-md border-0 overflow-hidden">
      <CardHeader className="bg-white dark:bg-zinc-950 pb-4 border-b">
        <CardTitle>Live Mechanic Locations</CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-[300px]">
        <Map mechanics={mechanics} />
      </CardContent>
    </Card>
  );
}
