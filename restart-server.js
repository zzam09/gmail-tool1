// Restart server with correct configuration
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Restarting server with correct configuration...\n');

// Read current .env.local
const envPath = path.join(__dirname, '.env.local');
let envContent = fs.readFileSync(envPath, 'utf8');

// Fix NEXTAUTH_URL to use port 3001
envContent = envContent.replace('NEXTAUTH_URL=http://localhost:3000', 'NEXTAUTH_URL=http://localhost:3001');

// Write back
fs.writeFileSync(envPath, envContent);
console.log('✅ Fixed NEXTAUTH_URL to use port 3001');

// Kill existing process on port 3001
const { exec } = require('child_process');
exec('taskkill /F /IM node.exe', (error, stdout, stderr) => {
  if (error) {
    console.log('No existing node processes to kill');
  } else {
    console.log('✅ Killed existing node processes');
  }
  
  // Start new server
  console.log('\n🚀 Starting development server...');
  const server = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });
  
  server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
  });
});
