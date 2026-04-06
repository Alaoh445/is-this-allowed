import http from 'http';

const run = async () => {
  const get = () => new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port: 5001, path: '/api/health', method: 'GET' }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.end();
  });

  const post = () => new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port: 5001, path: '/api/answer', method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(JSON.stringify({ question: 'Is this allowed?', state: 'Nigeria' }));
    req.end();
  });

  console.log('HEALTH', await get());
  console.log('ANSWER', await post());
};

run().catch(err => { console.error(err); process.exit(1); });
