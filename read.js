import * as dotenv from "dotenv";
import { readProducts } from "./helpers/read.js";
import { GraphQLClient } from "graphql-request";
dotenv.config();

const shop = process.env.SHOP;
const accessToken = process.env.ACCESS_TOKEN;

console.log("App started (Read only)...", { shop, accessToken });

if (shop && accessToken) {
  const graphqlEndpoint = `https://${shop}.myshopify.com/admin/api/2022-07/graphql.json`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': accessToken,
  }
  const client = new GraphQLClient(graphqlEndpoint, { headers });
  const products = await readProducts(client);
  console.log("Read Products ==>", JSON.stringify(products, null, 2));
}
