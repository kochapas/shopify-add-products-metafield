import { gql } from "graphql-request";

export const readProducts = async (client) => {
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
  return await client.request(readProducts, {})
    .then(async res => res?.products?.nodes);
}
