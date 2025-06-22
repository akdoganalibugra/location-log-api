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
    prisma.user.create({ data: { name: 'Ahmet', surname: 'Yılmaz' } }),
    prisma.user.create({ data: { name: 'Elif', surname: 'Demir' } }),
    prisma.user.create({ data: { name: 'Murat', surname: 'Kaya' } }),
  ]);

  console.log(`Created ${users.length} users`);

  // Seed areas (polygon: [ [lng, lat], ... ])
  const areaDefs = [
    {
      name: 'Taksim Square',
      polygon: [
        [28.9845, 41.0364],
        [28.9855, 41.0364],
        [28.9855, 41.0374],
        [28.9845, 41.0374],
        [28.9845, 41.0364], // Close polygon (first = last)
      ],
    },
    {
      name: 'Galata Square',
      polygon: [
        [28.9739, 41.0252],
        [28.9749, 41.0252],
        [28.9749, 41.0262],
        [28.9739, 41.0262],
        [28.9739, 41.0252],
      ],
    },
    {
      name: 'Gülhane Park',
      polygon: [
        [28.9786, 41.0131],
        [28.9796, 41.0131],
        [28.9796, 41.0141],
        [28.9786, 41.0141],
        [28.9786, 41.0131],
      ],
    },
  ];

  // Add areas to DB with polygon as JSON
  const areas = [];
  for (const def of areaDefs) {
    const area = await prisma.area.create({
      data: {
        name: def.name,
        polygon: def.polygon as any,
      },
    });
    areas.push(area);
  }
  console.log(`Created ${areas.length} areas with polygon data`);

  // Update 'geom' field for PostGIS, using polygon (as GeoJSON)
  for (const area of areas) {
    const geojson = JSON.stringify({
      type: 'Polygon',
      coordinates: [area.polygon],
    });

    await prisma.$executeRawUnsafe(
      `UPDATE "areas" SET geom = ST_GeomFromGeoJSON($1) WHERE id = $2`,
      geojson,
      area.id,
    );
  }
  console.log('Updated geom field for all areas');

  // Seed logs (AreaEntryLog)
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
  console.log(`Created ${logs.length} area entry logs`);

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
