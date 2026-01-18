const { PrismaClient } = require('../src/generated/prisma/client');

const prisma = new PrismaClient();

async function checkConstraints() {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        tc.constraint_name, 
        tc.constraint_type,
        string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
      WHERE 
        tc.table_name = 'Rating'
        AND tc.constraint_type = 'UNIQUE'
      GROUP BY tc.constraint_name, tc.constraint_type
    `;
    
    console.log('Unique constraints on Rating table:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConstraints();
