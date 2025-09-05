import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  'Ballet',
  'Jazz',
  'Tap',
  'Lyrical',
  'Contemporary',
  'Hip-Hop',
  'Modern',
  'Character',
  'Musical Theatre',
  'Competition',
  'Recreational',
  'Performance',
  'Practice',
  'Costume',
  'Accessories'
];

async function seedCategories() {
  try {
    console.log('Seeding costume categories...');
    
    for (const categoryName of categories) {
      await prisma.costumeCategory.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName },
      });
      console.log(`✓ Created/updated category: ${categoryName}`);
    }
    
    console.log('✅ All categories seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();
