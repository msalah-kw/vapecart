const https = require('https');

const query = `
query GetPageBySlug($id: ID!) {
  page(id: $id, idType: URI) {
    id
    databaseId
    title
    content
    slug
  }
}
`;

function fetchAPI(data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'lightgrey-flamingo-522119.hostingersite.com',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  try {
    const testPages = ['about-us', 'privacy-policy', 'faq'];
    for (const slug of testPages) {
      console.log(`Querying page with URI: ${slug}`);
      const res = await fetchAPI(JSON.stringify({
        query,
        variables: { id: slug }
      }));
      console.log(JSON.stringify(res, null, 2));
    }
  } catch (err) {
    console.error(err);
  }
}

run();
