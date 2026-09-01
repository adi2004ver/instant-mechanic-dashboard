import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CreditCard, Users, CalendarCheck, CalendarDays, CalendarX, Wrench } from 'lucide-react';

export default function Overview({ data }: { data: any }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-md border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-200">Total Revenue</CardTitle>
          <CreditCard className="h-5 w-5 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">₹{data.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </CardContent>
      </Card>
      <Card className="shadow-md border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
          <CalendarDays className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.todayBookings}</div>
        </CardContent>
      </Card>
      <Card className="shadow-md border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Bookings</CardTitle>
          <CalendarCheck className="h-5 w-5 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.completedBookings}</div>
        </CardContent>
      </Card>
      <Card className="shadow-md border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
          <Activity className="h-5 w-5 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.pendingBookings}</div>
        </CardContent>
      </Card>
      <Card className="shadow-md border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cancelled Bookings</CardTitle>
          <CalendarX className="h-5 w-5 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.cancelledBookings}</div>
        </CardContent>
      </Card>
      <Card className="shadow-md border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          <Activity className="h-5 w-5 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalBookings}</div>
        </CardContent>
      </Card>
      <Card className="shadow-md border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Mechanics</CardTitle>
          <Wrench className="h-5 w-5 text-cyan-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.activeMechanics}</div>
        </CardContent>
      </Card>
      <Card className="shadow-md border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Customers</CardTitle>
          <Users className="h-5 w-5 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.newCustomers}</div>
        </CardContent>
      </Card>
    </div>
  );
}
