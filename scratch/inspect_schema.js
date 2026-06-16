const https = require('https');

const query = `
query IntrospectAttributes {
  typeGlobal: __type(name: "GlobalProductAttribute") {
    name
    fields {
      name
      type {
        name
        kind
        ofType {
          name
          kind
        }
      }
    }
  }
  typeLocal: __type(name: "LocalProductAttribute") {
    name
    fields {
      name
      type {
        name
        kind
        ofType {
          name
          kind
        }
      }
    }
  }
  typeVariation: __type(name: "VariationAttribute") {
    name
    fields {
      name
      type {
        name
        kind
        ofType {
          name
          kind
        }
      }
    }
  }
}
`;

const data = JSON.stringify({ query });

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
      const response = JSON.parse(body);
      console.log(JSON.stringify(response, null, 2));
    } catch (e) {
      console.error("Failed to parse response:", e);
      console.log("Raw body:", body);
    }
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
