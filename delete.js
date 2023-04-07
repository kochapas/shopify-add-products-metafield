import * as dotenv from "dotenv";
import { gql, GraphQLClient } from "graphql-request";
dotenv.config();

const shop = process.env.SHOP;
const accessToken = process.env.ACCESS_TOKEN;

console.log("App started (Delete mode)...", { shop, accessToken });

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
              namespace
              type
              value
            }
          }
          title
        }
      }
    }
  `;
  const products = await client.request(readProducts, {}, headers)
    .then(async res => res?.products?.nodes);
  console.log("Read Products ==>", JSON.stringify(products, null, 2));

  // Delete product's metafields.
  const deleteProductMeta = gql `
    mutation metafieldDelete($input: MetafieldDeleteInput!) {
      metafieldDelete(input: $input) {
        deletedId
        userErrors {
          field
          message
        }
      }
    }
  `;

  products.forEach(async (product) => {
    product?.metafields?.nodes?.forEach(async (metafield) => {
      const variables = {
        input: {
          id: metafield.id,
        }
      };

      const result = await client.request(deleteProductMeta, variables, headers)
        .catch((error) => {
          console.log("Error ==>", JSON.stringify(error, null, 2));
        });
      console.log("Delete Metafield ==>", JSON.stringify(result, null, 2));
    })
  });
}
