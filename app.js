import * as dotenv from "dotenv";
import { gql, GraphQLClient } from "graphql-request";
dotenv.config();

const shop = process.env.SHOP;
const accessToken = process.env.ACCESS_TOKEN;

console.log("App started...", { shop, accessToken });

if (shop && accessToken) {
  const graphqlEndpoint = `https://${shop}.myshopify.com/admin/api/2022-07/graphql.json`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': accessToken,
  }
  const client = new GraphQLClient(graphqlEndpoint);
  // Read product's metafield.
  const readProducts = gql `
    {
      products(first: 10) {
        nodes {
          id
          metafields(first: 3) {
            nodes {
              id
              key
              value
            }
          }
        }
      }
    }
  `;
  const products = await client.request(readProducts, {}, headers)
    .then(async res => res?.products?.nodes);
  console.log({ products });
}
