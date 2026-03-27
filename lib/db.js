import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const sql = neon(process.env.DATABASE_URL);

// Initialize database schema
export async function initDatabase() {
  try {
    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        access_token TEXT,
        refresh_token TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // Create index for faster email lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `;
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// User operations
export const db = {
  // Find user by email
  async findByEmail(email) {
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    return result[0] || null;
  },
  
  // Find user by ID
  async findById(id) {
    const result = await sql`SELECT * FROM users WHERE id = ${id}`;
    return result[0] || null;
  },
  
  // Create or update user
  async upsert(user) {
    const { id, name, email, accessToken, refreshToken } = user;
    
    const result = await sql`
      INSERT INTO users (id, name, email, access_token, refresh_token)
      VALUES (${id}, ${name}, ${email}, ${accessToken}, ${refreshToken})
      ON CONFLICT (email) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        updated_at = NOW()
      RETURNING *
    `;
    
    return result[0];
  },
  
  // Update user tokens
  async updateTokens(email, accessToken, refreshToken) {
    const result = await sql`
      UPDATE users 
      SET access_token = ${accessToken}, 
          refresh_token = ${refreshToken},
          updated_at = NOW()
      WHERE email = ${email}
      RETURNING *
    `;
    
    return result[0];
  },
  
  // Delete user by ID
  async deleteById(id) {
    const result = await sql`DELETE FROM users WHERE id = ${id} RETURNING *`;
    return result[0] || null;
  },
  
  // Delete user by email (keep existing method)
  async delete(email) {
    const result = await sql`DELETE FROM users WHERE email = ${email} RETURNING *`;
    return result[0] || null;
  },
  
  // Get all users (for debugging)
  async getAll() {
    return await sql`SELECT * FROM users ORDER BY created_at DESC`;
  }
};
