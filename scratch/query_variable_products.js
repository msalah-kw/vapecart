const https = require('https');

const query = `
query GetVariableProducts {
  products(first: 10, where: { search: "50000" }) {
    nodes {
      slug
      __typename
      name
      ... on ProductWithAttributes {
        attributes {
          nodes {
            name
            label
            options
            variation
            visible
            ... on GlobalProductAttribute {
              terms {
                nodes {
                  name
                  slug
                }
              }
            }
          }
        }
      }
      ... on VariableProduct {
        variations {
          nodes {
            id
            databaseId
            name
            attributes {
              nodes {
                name
                value
              }
            }
          }
        }
      }
    }
  }
}
`;

const data = JSON.stringify({ query });

function fetchAPI() {
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
    const res = await fetchAPI();
    console.log(JSON.stringify(res.data.products.nodes, null, 2));
  } catch (err) {
    console.error(err);
  }
}

run();
