import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { MapPin } from 'lucide-react';

export default function MechanicsList() {
  const [mechanics, setMechanics] = useState([]);

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

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Available': return <Badge variant="secondary" className="bg-green-100 text-green-800">Available</Badge>;
      case 'Busy': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Busy</Badge>;
      case 'Offline': return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Offline</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMockLocationName = (id: number) => {
    const locations = [
      "Connaught Place, New Delhi",
      "Karol Bagh, New Delhi",
      "Hauz Khas, New Delhi",
      "Dwarka, New Delhi",
      "Vasant Kunj, New Delhi",
      "Saket, New Delhi",
      "Lajpat Nagar, New Delhi",
      "Rohini, New Delhi",
      "Chandni Chowk, New Delhi",
      "Greater Kailash, New Delhi"
    ];
    return locations[id % locations.length];
  };

  return (
    <Card className="h-full shadow-md border-0">
      <CardHeader className="bg-slate-50 dark:bg-zinc-900 border-b">
        <CardTitle className="text-xl">Mechanics Status</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {mechanics.map((mechanic: any) => (
            <div key={mechanic.id} className="flex items-center justify-between border-b pb-3 last:border-0">
              <div className="flex flex-col space-y-1">
                <span className="font-semibold">{mechanic.name}</span>
                <span className="text-sm text-muted-foreground">
                  Jobs Completed: {mechanic.jobsDone}
                </span>
                {mechanic.bookings?.[0] && (
                  <span className="text-xs text-muted-foreground truncate w-48">
                    Last: {mechanic.bookings[0].service.name} ({format(new Date(mechanic.bookings[0].date), 'MMM d')})
                  </span>
                )}
                {mechanic.lat && mechanic.lng && (
                  <span className="text-xs text-muted-foreground flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-orange-500" />
                    {getMockLocationName(mechanic.id)}
                  </span>
                )}
              </div>
              <div>{getStatusBadge(mechanic.status)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
