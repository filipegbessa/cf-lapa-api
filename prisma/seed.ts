import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const movements = [
    { name: 'Snatch', description: 'Levantamento olímpico explosivo em um movimento' },
    { name: 'Clean & Jerk', description: 'Levantamento olímpico em dois movimentos' },
    { name: 'Back Squat', description: 'Agachamento com barra nas costas' },
    { name: 'Front Squat', description: 'Agachamento com barra na frente' },
    { name: 'Deadlift', description: 'Levantamento da barra do chão' },
    { name: 'Bench Press', description: 'Supino com barra' },
    { name: 'Overhead Press', description: 'Desenvolvimento com barra' },
    { name: 'Pull-ups', description: 'Barra fixa com peso do corpo' },
    { name: 'Push-ups', description: 'Flexão de braço no chão' },
    { name: 'Rope Climbs', description: 'Subida na corda' },
    { name: 'Box Jumps', description: 'Pulo para cima de uma caixa' },
    { name: 'Muscle-ups', description: 'Passagem de barra com flexão' },
    { name: 'Burpees', description: 'Agachamento com barra e pulo' },
    { name: 'Wall Ball', description: 'Lançamento de bola para parede' },
    { name: 'Kettlebell Swing', description: 'Balanço de kettlebell' },
  ];

  console.log('🌱 Seeding movements...');

  for (const movement of movements) {
    const existing = await prisma.movement.findUnique({
      where: { name: movement.name },
    });

    if (!existing) {
      await prisma.movement.create({ data: movement });
      console.log(`✅ Created movement: ${movement.name}`);
    } else {
      console.log(`⏭️  Movement already exists: ${movement.name}`);
    }
  }

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
