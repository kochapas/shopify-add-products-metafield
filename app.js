import * as dotenv from "dotenv";
import { readProducts } from "./helpers/read.js";
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
  const client = new GraphQLClient(graphqlEndpoint, { headers });
  const products = await readProducts(client);
  console.log("Read Products ==>", JSON.stringify(products, null, 2));
  // Add/Update product's metafield.
  const updateProductMeta = gql `
    mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
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
        userErrors {
          field
          message
        }
      }
    }
  `;

  products.forEach(async (product) => {
    if (!product?.metafields?.nodes?.length) {
      // No metafield, add new metafield immediately.
      const variables = {
        input: {
          id: product.id,
          metafields: [
            {
              key: "test",
              namespace: "global",
              type: "number_integer",
              value: "0"
            }
          ]
        }
      };

      const result = await client.request(updateProductMeta, variables, headers)
        .catch((error) => {
          console.log("Error ==>", JSON.stringify(error, null, 2));
        });
      console.log("Add Metafield ==>", JSON.stringify(result, null, 2));
    } else {
      product?.metafields?.nodes.forEach(async (metafield) => {
        if (metafield.key === "test" && metafield.namespace === "global") {
          const value = Number.parseInt(metafield.value);
          // Metafield matched. Update value.
          const variables = {
            input: {
              id: product.id,
              metafields: [
                {
                  id: metafield.id,
                  key: "test",
                  namespace: "global",
                  type: "number_integer",
                  value: `${value + 1}`
                }
              ]
            }
          };

          const result = await client.request(updateProductMeta, variables, headers)
            .catch((error) => {
              console.log("Error ==>", JSON.stringify(error, null, 2));
            });
          console.log("Update Metafield ==>", JSON.stringify(result, null, 2));
        }
      });
    }
  });
}
