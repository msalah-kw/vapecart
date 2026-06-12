# GraphQL Data Fetching Strategy
- **Endpoint:** `https://[your-wp-domain]/graphql`
- **Method:** Use native `fetch` API inside Next.js Server Components.
- **Queries Required:**
  1. Fetch all products (to generate static paths).
  2. Fetch single product details (Title, Price in KWD, Featured Image, Attributes like نكهة or قوة, Excerpt max ~160 characters).
  3. Fetch categories and map them to the frontend navigation structure.