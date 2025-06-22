import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data for idempotency
  console.log('Cleaning existing seed data...');
  await prisma.areaEntryLog.deleteMany({});
  await prisma.area.deleteMany({});
  await prisma.user.deleteMany({});

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Ahmet',
        surname: 'Yılmaz',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Elif',
        surname: 'Demir',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Murat',
        surname: 'Kaya',
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Taksim Square
  await prisma.$executeRaw`
   INSERT INTO areas (id, name, geom, "createdAt", "updatedAt")
   VALUES (
     gen_random_uuid()::text,
     'Taksim Square',
     ST_GeomFromText('POLYGON((28.9845 41.0364, 28.9855 41.0364, 28.9855 41.0374, 28.9845 41.0374, 28.9845 41.0364))', 4326),
     NOW(),
     NOW()
   )
 `;

  // Galata Square
  await prisma.$executeRaw`
   INSERT INTO areas (id, name, geom, "createdAt", "updatedAt")
   VALUES (
     gen_random_uuid()::text,
     'Galata Square',
     ST_GeomFromText('POLYGON((28.9739 41.0252, 28.9749 41.0252, 28.9749 41.0262, 28.9739 41.0262, 28.9739 41.0252))', 4326),
     NOW(),
     NOW()
   )
 `;

  // Gülhane Park
  await prisma.$executeRaw`
   INSERT INTO areas (id, name, geom, "createdAt", "updatedAt")
   VALUES (
     gen_random_uuid()::text,
     'Gülhane Park',
     ST_GeomFromText('POLYGON((28.9786 41.0131, 28.9796 41.0131, 28.9796 41.0141, 28.9786 41.0141, 28.9786 41.0131))', 4326),
     NOW(),
     NOW()
   )
 `;

  console.log(`Created 3 areas with PostGIS geometry`);

  const areas = await prisma.area.findMany({
    select: { id: true, name: true },
  });

  const logs = await Promise.all([
    prisma.areaEntryLog.create({
      data: {
        userId: users[0].id,
        areaId: areas[0].id,
        entryTime: new Date('2025-06-21T10:00:00Z'),
      },
    }),
    prisma.areaEntryLog.create({
      data: {
        userId: users[1].id,
        areaId: areas[1].id,
        entryTime: new Date('2025-06-21T11:00:00Z'),
      },
    }),
    prisma.areaEntryLog.create({
      data: {
        userId: users[2].id,
        areaId: areas[2].id,
        entryTime: new Date('2025-06-21T12:00:00Z'),
      },
    }),
  ]);

  console.log(`Created ${logs.length} entry logs`);
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
