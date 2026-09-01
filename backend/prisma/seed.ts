import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clear old data
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.mechanic.deleteMany();
  await prisma.customer.deleteMany();

  // Create Services
  const services = [
    { name: 'Oil Change', category: 'Maintenance', price: 2500 },
    { name: 'Brake Pad Replacement', category: 'Repair', price: 4500 },
    { name: 'Tire Rotation', category: 'Maintenance', price: 800 },
    { name: 'Engine Diagnostics', category: 'Diagnostics', price: 1500 },
    { name: 'Battery Replacement', category: 'Electrical', price: 5500 },
    { name: 'Transmission Fluid Flush', category: 'Maintenance', price: 3500 },
    { name: 'AC Recharge', category: 'HVAC', price: 2000 },
  ];

  for (const service of services) {
    await prisma.service.create({ data: service });
  }

  // Create Mechanics
  const mechanicNames = [
    'Rahul Sharma', 'Vikram Singh', 'Amit Kumar', 'Ravi Patel', 'Sanjay Gupta',
    'Rajesh Verma', 'Suresh Reddy', 'Mohammad Ali', 'Manoj Tiwari', 'Dinesh Yadav',
    'Arjun Nair', 'Prakash Joshi', 'Gaurav Chawla', 'Sunil Das', 'Anil Mishra',
    'Manish Pandey', 'Ramesh Chaudhary', 'Vijay Iyer', 'Deepak Rathi', 'Ashok Menon'
  ];

  for (const name of mechanicNames) {
    // Delhi coordinates roughly: 28.6139, 77.2090
    // Generate random offsets
    const latOffset = (Math.random() - 0.5) * 0.2;
    const lngOffset = (Math.random() - 0.5) * 0.2;
    await prisma.mechanic.create({
      data: {
        name,
        status: Math.random() > 0.8 ? 'Busy' : (Math.random() > 0.9 ? 'Offline' : 'Available'),
        jobsDone: Math.floor(Math.random() * 500),
        lat: 28.6139 + latOffset,
        lng: 77.2090 + lngOffset,
      }
    });
  }

  // Create Customers
  const customerFirstNames = ['Aarav', 'Vihaan', 'Aditya', 'Sai', 'Arjun', 'Siddharth', 'Rohan', 'Dhruv', 'Kartik', 'Abhishek', 'Diya', 'Ananya', 'Aadhya', 'Priya', 'Kavya', 'Neha', 'Pooja', 'Sneha', 'Riya', 'Tanvi'];
  const customerLastNames = ['Sharma', 'Verma', 'Kumar', 'Singh', 'Patel', 'Reddy', 'Rao', 'Nair', 'Iyer', 'Joshi', 'Mishra', 'Pandey', 'Chopra', 'Kapoor', 'Gupta'];

  for (let i = 1; i <= 55; i++) {
    const firstName = customerFirstNames[Math.floor(Math.random() * customerFirstNames.length)];
    const lastName = customerLastNames[Math.floor(Math.random() * customerLastNames.length)];
    await prisma.customer.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}${i}@example.com`,
        phone: `+91 ${Math.floor(6000000000 + Math.random() * 3999999999)}`,
      }
    });
  }

  // Create Bookings
  const statuses = ['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'];
  const allCustomers = await prisma.customer.findMany();
  const allMechanics = await prisma.mechanic.findMany();
  const allServices = await prisma.service.findMany();

  for (let i = 1; i <= 500; i++) {
    const customer = allCustomers[Math.floor(Math.random() * allCustomers.length)];
    const service = allServices[Math.floor(Math.random() * allServices.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)] as string;
    
    let mechanicId: number | null = null;
    if (status !== 'Pending' && status !== 'Cancelled') {
      const mechanic = allMechanics[Math.floor(Math.random() * allMechanics.length)];
      mechanicId = mechanic ? mechanic.id : null;
    }

    // Distribute dates over the last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

    if (customer && service) {
      await prisma.booking.create({
        data: {
          customerId: customer.id,
          mechanicId,
          serviceId: service.id,
          status,
          amount: service.price,
          date,
        }
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
