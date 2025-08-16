// pages/api/image-proxy.js
import https from 'https';
import http from 'http';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // Only allow S3 URLs for security
    if (!url.includes('s3.amazonaws.com')) {
      return res.status(403).json({ error: 'Only S3 URLs are allowed' });
    }



    // Parse URL to get hostname and path
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageProxy/1.0)',
        'Accept': 'image/*,*/*;q=0.8',
      },
      // Ignore SSL certificate errors for development
      rejectUnauthorized: false,
      timeout: 10000, // 10 second timeout
    };

    const client = isHttps ? https : http;

    const imageData = await new Promise((resolve, reject) => {
      const request = client.request(options, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }

        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            buffer,
            contentType: response.headers['content-type'] || 'image/jpeg',
            contentLength: buffer.length,
          });
        });
      });

      request.on('error', (error) => {
        console.error('Request error:', error);
        reject(error);
      });

      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });

      request.setTimeout(10000);
      request.end();
    });

    // Set appropriate headers
    res.setHeader('Content-Type', imageData.contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.setHeader('Content-Length', imageData.contentLength);
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Send the image data
    res.send(imageData.buffer);

  } catch (error) {
    console.error('Image proxy error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch image',
      details: error.message,
      url: url 
    });
  }
} 