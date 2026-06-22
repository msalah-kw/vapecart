const https = require('https');

const query = `
query GetProductReviews($id: ID!) {
  product(id: $id, idType: ID) {
    id
    averageRating
    reviewCount
    reviews(first: 100) {
      edges {
        rating
        node {
          id
          databaseId
          content
          date
          status
          approved
          author {
            node {
              name
            }
          }
        }
      }
    }
  }
}
`;

// Global ID for "يو ويل مارسو بود" which we saw earlier: "cG9zdDo4NjYw"
const data = JSON.stringify({
  query,
  variables: { id: "cG9zdDo4NjYw" }
});

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
    }
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
