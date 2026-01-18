#!/usr/bin/env node

/**
 * Script to make a user an admin
 * Usage: node scripts/make-admin.js <username>
 */

const { PrismaClient } = require('../src/generated/prisma/client');

const prisma = new PrismaClient();

async function makeAdmin(username) {
  if (!username) {
    console.error('Usage: node scripts/make-admin.js <username>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { username },
      data: { role: 'admin' },
    });

    console.log(`✅ Successfully made ${username} an admin!`);
    console.log(`User ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
  } catch (error) {
    if (error.code === 'P2025') {
      console.error(`❌ User '${username}' not found`);
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const username = process.argv[2];
makeAdmin(username);
