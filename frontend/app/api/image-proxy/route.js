import https from 'https';
import http from 'http';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return Response.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  if (!url.includes('s3.amazonaws.com') && !url.includes('localhost')) {
    return Response.json({ error: 'Only S3 URLs and localhost are allowed' }, { status: 403 });
  }

  try {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageProxy/1.0)',
        Accept: 'image/*,*/*;q=0.8',
      },
      rejectUnauthorized: false,
      timeout: 10000,
    };

    const client = isHttps ? https : http;

    const imageData = await new Promise((resolve, reject) => {
      const req = client.request(options, (response) => {
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
          });
        });
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
      req.setTimeout(10000);
      req.end();
    });

    return new Response(imageData.buffer, {
      headers: {
        'Content-Type': imageData.contentType,
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch image', details: error.message },
      { status: 500 }
    );
  }
}
