import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});
const prisma = new PrismaClient();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/services', async (req, res) => {
  try {
    const services = await prisma.service.findMany();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Mechanics CRUD
app.post('/api/mechanics', async (req, res) => {
  try {
    const { name, status, lat, lng } = req.body;
    const mechanic = await prisma.mechanic.create({
      data: { name, status, lat, lng }
    });
    io.emit('bookingStatusChanged'); // Tell clients data changed
    res.json(mechanic);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create mechanic' });
  }
});

app.put('/api/mechanics/:id', async (req, res) => {
  try {
    const { name, status, lat, lng } = req.body;
    const mechanic = await prisma.mechanic.update({
      where: { id: Number(req.params.id) },
      data: { name, status, lat, lng }
    });
    io.emit('bookingStatusChanged');
    res.json(mechanic);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update mechanic' });
  }
});

app.delete('/api/mechanics/:id', async (req, res) => {
  try {
    await prisma.mechanic.delete({
      where: { id: Number(req.params.id) }
    });
    io.emit('bookingStatusChanged');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete mechanic' });
  }
});

// Services CRUD
app.post('/api/services', async (req, res) => {
  try {
    const { name, category, price } = req.body;
    const service = await prisma.service.create({
      data: { name, category, price: Number(price) }
    });
    io.emit('bookingStatusChanged');
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const { name, category, price } = req.body;
    const service = await prisma.service.update({
      where: { id: Number(req.params.id) },
      data: { name, category, price: Number(price) }
    });
    io.emit('bookingStatusChanged');
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service' });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    await prisma.service.delete({
      where: { id: Number(req.params.id) }
    });
    io.emit('bookingStatusChanged');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Bookings CRUD
app.post('/api/bookings', async (req, res) => {
  try {
    const { customerName, customerEmail, serviceId, mechanicId, amount } = req.body;
    
    // Create customer if needed, or just create a new one for simplicity
    const customer = await prisma.customer.create({
      data: {
        name: customerName,
        email: customerEmail || `${customerName.replace(' ', '').toLowerCase()}${Math.floor(Math.random()*1000)}@example.com`,
        phone: '+91 0000000000'
      }
    });

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        serviceId: Number(serviceId),
        mechanicId: mechanicId ? Number(mechanicId) : null,
        amount: Number(amount),
        status: mechanicId ? 'Assigned' : 'Pending',
        date: new Date()
      },
      include: {
        customer: true,
        service: true,
        mechanic: true
      }
    });

    io.emit('bookingStatusChanged');
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// API endpoints
app.get('/api/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalBookings,
      todayBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,
      activeMechanics,
      newCustomers,
      totalRevenueData
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { date: { gte: today } } }),
      prisma.booking.count({ where: { status: 'Completed' } }),
      prisma.booking.count({ where: { status: 'Pending' } }),
      prisma.booking.count({ where: { status: 'Cancelled' } }),
      prisma.mechanic.count({ where: { status: 'Available' } }), // Or 'Busy'
      prisma.customer.count({ where: { createdAt: { gte: today } } }),
      prisma.booking.aggregate({
        where: { status: 'Completed' },
        _sum: { amount: true }
      })
    ]);

    res.json({
      totalBookings,
      todayBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,
      totalRevenue: totalRevenueData._sum.amount || 0,
      activeMechanics,
      newCustomers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, sort = 'date', order = 'desc' } = req.query;
    
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;
    
    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }
    if (search) {
      whereClause.customer = {
        name: { contains: search as string }
      };
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        include: {
          customer: true,
          mechanic: true,
          service: true,
        },
        orderBy: {
          [sort as string]: order,
        },
        skip,
        take: limitNumber,
      }),
      prisma.booking.count({ where: whereClause })
    ]);

    res.json({
      data: bookings,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { customer: true, mechanic: true, service: true }
    });
    if (!booking) return res.status(404).json({ error: 'Not found' });
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await prisma.booking.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
      include: { customer: true, mechanic: true, service: true }
    });
    
    // Broadcast the update via WebSocket
    io.emit('bookingStatusChanged', booking);
    
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/mechanics', async (req, res) => {
  try {
    const mechanics = await prisma.mechanic.findMany({
      include: {
        bookings: {
          orderBy: { date: 'desc' },
          take: 1,
          include: { service: true }
        }
      }
    });
    res.json(mechanics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    // Basic analytics implementation
    // For a real app, we'd group by date properly, here we fetch recent and group in memory or using raw SQL
    
    // Service breakdown
    const serviceBreakdownRaw = await prisma.booking.groupBy({
      by: ['serviceId'],
      _count: { id: true }
    });
    
    const services = await prisma.service.findMany();
    const serviceBreakdown = serviceBreakdownRaw.map(item => ({
      name: services.find(s => s.id === item.serviceId)?.name || 'Unknown',
      value: item._count.id
    }));

    // Status breakdown
    const statusBreakdownRaw = await prisma.booking.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    const statusBreakdown = statusBreakdownRaw.map(item => ({
      name: item.status,
      value: item._count.id
    }));

    res.json({ serviceBreakdown, statusBreakdown });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`Backend API and WebSocket server listening on port ${port}`);
});
