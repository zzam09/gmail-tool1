import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from './lib/db.js';

async function test() {
  try {
    console.log('Testing database connection...');
    const users = await db.getAll();
    console.log('Users found:', users.length);
    users.forEach(u => {
      console.log(`- ID: ${u.id}, Email: ${u.email}, Has Token: ${!!u.access_token}`);
    });
  } catch (error) {
    console.error('Database error:', error.message);
  }
}

test();
