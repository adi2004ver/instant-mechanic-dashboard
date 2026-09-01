'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { io } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const socket = io(API_URL);

export default function ManagementTab() {
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [newMechName, setNewMechName] = useState('');
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('');
  
  const [bCustomerName, setBCustomerName] = useState('');
  const [bServiceId, setBServiceId] = useState('');
  const [bMechanicId, setBMechanicId] = useState('');

  const fetchData = async () => {
    try {
      const [mechRes, servRes] = await Promise.all([
        api.get('/mechanics'),
        api.get('/services')
      ]);
      setMechanics(mechRes.data);
      setServices(servRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    socket.on('bookingStatusChanged', fetchData);
    return () => { socket.off('bookingStatusChanged', fetchData); };
  }, []);

  const addMechanic = async () => {
    if (!newMechName) return;
    await api.post('/mechanics', { name: newMechName, status: 'Available', lat: 28.6139, lng: 77.2090 });
    setNewMechName('');
  };

  const deleteMechanic = async (id: number) => {
    await api.delete(`/mechanics/${id}`);
  };

  const addService = async () => {
    if (!newServiceName || !newServicePrice) return;
    await api.post('/services', { name: newServiceName, category: newServiceCategory || 'General', price: newServicePrice });
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceCategory('');
  };

  const deleteService = async (id: number) => {
    await api.delete(`/services/${id}`);
  };

  const addBooking = async () => {
    if (!bCustomerName || !bServiceId) return;
    const service = services.find(s => s.id === Number(bServiceId));
    if (!service) return;
    
    await api.post('/bookings', {
      customerName: bCustomerName,
      serviceId: bServiceId,
      mechanicId: bMechanicId,
      amount: service.price
    });
    setBCustomerName('');
    setBServiceId('');
    setBMechanicId('');
    alert('Booking created successfully! The dashboard has been updated.');
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md border-0">
        <CardHeader className="bg-slate-50 dark:bg-zinc-900 border-b">
          <CardTitle>Create New Booking</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 flex gap-4 flex-wrap items-end">
          <div className="space-y-1">
            <label className="text-sm font-medium">Customer Name</label>
            <Input placeholder="e.g. Ramesh Kumar" value={bCustomerName} onChange={e => setBCustomerName(e.target.value)} className="w-48" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Service</label>
            <select className="flex h-9 w-48 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" value={bServiceId} onChange={e => setBServiceId(e.target.value)}>
              <option value="">Select Service...</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} (₹{s.price})</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Assign Mechanic (Optional)</label>
            <select className="flex h-9 w-48 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" value={bMechanicId} onChange={e => setBMechanicId(e.target.value)}>
              <option value="">Leave Unassigned</option>
              {mechanics.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <Button onClick={addBooking} className="bg-orange-500 hover:bg-orange-600">Create Booking</Button>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-md border-0">
        <CardHeader className="bg-slate-50 dark:bg-zinc-900 border-b">
          <CardTitle>Manage Mechanics</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="flex gap-2">
            <Input placeholder="New mechanic name" value={newMechName} onChange={e => setNewMechName(e.target.value)} />
            <Button onClick={addMechanic}>Add</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mechanics.map(m => (
                <TableRow key={m.id}>
                  <TableCell>{m.id}</TableCell>
                  <TableCell>{m.name}</TableCell>
                  <TableCell>{m.status}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => deleteMechanic(m.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-md border-0">
        <CardHeader className="bg-slate-50 dark:bg-zinc-900 border-b">
          <CardTitle>Manage Services</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Name" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} />
            <Input placeholder="Category" value={newServiceCategory} onChange={e => setNewServiceCategory(e.target.value)} />
            <Input placeholder="Price (₹)" type="number" value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} className="w-24" />
            <Button onClick={addService}>Add</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map(s => (
                <TableRow key={s.id}>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.category}</TableCell>
                  <TableCell>₹{s.price}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => deleteService(s.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
