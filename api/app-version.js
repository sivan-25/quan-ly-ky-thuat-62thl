/* One stable identifier per Vercel deployment. Never cache this response. */
module.exports = function appVersion(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, no-cache, max-age=0, must-revalidate');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }
  const version = process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.VERCEL_URL || process.env.VERCEL_DEPLOYMENT_ID || '';
  if (!version) {
    res.statusCode = 503;
    return res.end(JSON.stringify({ error: 'Build version unavailable' }));
  }
  res.statusCode = 200;
  return res.end(req.method === 'HEAD' ? '' : JSON.stringify({ version }));
};
