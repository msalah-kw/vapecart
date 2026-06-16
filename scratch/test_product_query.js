const https = require('https');

const query = `
query GetProductBySlug($id: ID!) {
  product(id: $id, idType: SLUG) {
    id
    databaseId
    slug
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
  }
}
`;

// Let's first search for a variable product slug by fetching latest products
const searchData = JSON.stringify({
  query: `
    query GetLatest {
      products(first: 20) {
        nodes {
          slug
          __typename
        }
      }
    }
  `
});

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
    const listRes = await fetchAPI(searchData);
    const variableProduct = listRes.data.products.nodes.find(p => p.__typename === 'VariableProduct');
    if (!variableProduct) {
      console.log("No variable product found in latest 20 products");
      console.log(JSON.stringify(listRes, null, 2));
      return;
    }
    console.log("Found variable product:", variableProduct.slug);
    
    const productRes = await fetchAPI(JSON.stringify({
      query,
      variables: { id: variableProduct.slug }
    }));
    console.log(JSON.stringify(productRes, null, 2));
  } catch (err) {
    console.error(err);
  }
}

run();
