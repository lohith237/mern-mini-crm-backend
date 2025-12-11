const crypto = require('crypto');
const fs = require('fs');

const jwtSecret = crypto.randomBytes(32).toString('base64');

try {
  const envContent = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';

  if (!envContent.includes('JWT_SECRET=')) {
    fs.appendFileSync('.env', `JWT_SECRET=${jwtSecret}\n`);
    console.log('JWT_SECRET has been saved to .env file');
  } else {
    console.log('JWT_SECRET already exists in .env file');
  }
} catch (err) {
  console.error('Error writing JWT_SECRET to .env file:', err);
}
