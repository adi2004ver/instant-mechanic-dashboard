import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { io } from 'socket.io-client';

const socket = io();

export default function BookingsTable() {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings', {
        params: {
          page,
          limit: 10,
          search,
          status: statusFilter === 'All' ? '' : statusFilter,
          sort: sortField,
          order: sortOrder
        }
      });
      setBookings(res.data.data);
      setTotal(res.data.meta.totalPages);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, search, statusFilter, sortField, sortOrder]);

  useEffect(() => {
    socket.on('bookingStatusChanged', () => {
      fetchBookings();
    });
    return () => {
      socket.off('bookingStatusChanged');
    };
  }, [page, search, statusFilter, sortField, sortOrder]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.put(`/bookings/${id}/status`, { status: newStatus });
      // WebSocket will trigger refetch
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Completed': return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'Pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'In Progress': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'Assigned': return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Assigned</Badge>;
      case 'Cancelled': return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const exportCSV = () => {
    if (bookings.length === 0) return;
    const headers = ['ID', 'Customer', 'Service', 'Mechanic', 'Amount', 'Date', 'Status'];
    const rows = bookings.map((b: any) => [
      b.id,
      `"${b.customer?.name || ''}"`,
      `"${b.service?.name || ''}"`,
      `"${b.mechanic?.name || ''}"`,
      b.amount,
      `"${new Date(b.date).toISOString()}"`,
      b.status
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('url');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'bookings.csv');
    a.click();
  };

  return (
    <Card className="shadow-md border-0">
      <CardHeader className="bg-slate-50 dark:bg-zinc-900 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Recent Bookings</CardTitle>
          <Button onClick={exportCSV} variant="default" className="bg-orange-500 hover:bg-orange-600">Export CSV</Button>
        </div>
        <div className="flex space-x-2 mt-4">
          <Input 
            placeholder="Search customer..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="w-1/3 bg-white dark:bg-zinc-950"
          />
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || '')}>
            <SelectTrigger className="w-1/4 bg-white dark:bg-zinc-950">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Assigned">Assigned</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="bg-white dark:bg-zinc-950">
            Sort by Date ({sortOrder.toUpperCase()})
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Mechanic</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking: any) => (
              <TableRow key={booking.id}>
                <TableCell>#{booking.id}</TableCell>
                <TableCell>{booking.customer?.name}</TableCell>
                <TableCell>{booking.service?.name}</TableCell>
                <TableCell>{booking.mechanic?.name || '-'}</TableCell>
                <TableCell>₹{booking.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>{format(new Date(booking.date), 'PP p')}</TableCell>
                <TableCell>{getStatusBadge(booking.status)}</TableCell>
                <TableCell>
                  <Select value={booking.status} onValueChange={(val) => handleStatusChange(booking.id, val)}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Update" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Assigned">Assigned</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-between items-center mt-4">
          <Button disabled={page === 1} onClick={() => setPage(page - 1)} variant="outline">Previous</Button>
          <span>Page {page} of {total || 1}</span>
          <Button disabled={page >= total} onClick={() => setPage(page + 1)} variant="outline">Next</Button>
        </div>
      </CardContent>
    </Card>
  );
}
