const http = require('http');
const jwt = require('jsonwebtoken');

// load env variables
// process.loadEnvFile('.env');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_PUBLIC = process.env.JWT_SECRET || 'your-public-key';
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '1d';

const parseBody = async (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', (error) => {
      reject(error);
    });
  });
};

// Generate response helper
const generateResponse = (res, statusCode, body) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Client-Version, Cache-Control, X-Api-Key'
  });
  res.end(JSON.stringify(body));
};

// Create HTTP server
const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return generateResponse(res, 204, null);

  if (req.method === 'POST' && req.url === '/token') {
    try {
      const requestBody = await parseBody(req) || {};
      const { exp, ...body } = requestBody;

      const payload = { ...body };
      const token = jwt.sign(payload, JWT_SECRET, { algorithm: 'RS256', expiresIn: exp ? `${exp}d` : TOKEN_EXPIRY });

      try {
        const decoded = jwt.verify(token, JWT_PUBLIC, { algorithms: ['RS256'] });
        console.log('Decoded token:', decoded);
      } catch (error) {
        console.error('Token verification failed:', error.message);
      }

      return generateResponse(res, 200, {
        token,
        expiresIn: TOKEN_EXPIRY,
        tokenType: 'Bearer'
      });

    } catch (error) {
      console.error('Error generating token:', error);
      return generateResponse(res, 500, {
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // Handle 404 for unknown endpoints
  return generateResponse(res, 404, {
    error: 'Not Found',
    message: 'Endpoint not found'
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Error handling for server
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
