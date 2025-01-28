const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Generate key pair
function generateKeyPair() {
  // Generate RSA key pair
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  // Save keys to files
  fs.writeFileSync('private.key', privateKey);
  fs.writeFileSync('public.key', publicKey);

  return { privateKey, publicKey };
}

// Example usage
function example() {
  // Generate keys
  const { privateKey, publicKey } = generateKeyPair();
  console.log('Keys generated successfully!');

  // Generate a token using private key
  const token = jwt.sign(
    { userId: '123', role: 'admin' },
    privateKey,
    {
      algorithm: 'RS256',
      expiresIn: '1h'
    }
  );
  console.log('Generated Token:', token);

  // Verify token using public key
  try {
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    console.log('Decoded token:', decoded);
  } catch (error) {
    console.error('Token verification failed:', error.message);
  }
}

// Run example
example();
