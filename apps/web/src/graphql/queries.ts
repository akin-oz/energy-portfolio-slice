import { gql } from "@apollo/client";

export const CUSTOMERS = gql /* GraphQL */ `
  query Customers($first: Int, $after: String) {
    customers(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          name
          createdAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const PROJECTS_BY_CUSTOMER = gql /* GraphQL */ `
  query ProjectsByCustomer($customerId: ID!, $first: Int, $after: String, $status: ProjectStatus) {
    projectsByCustomer(customerId: $customerId, first: $first, after: $after, status: $status) {
      edges {
        cursor
        node {
          id
          name
          status
          createdAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const ASSETS_BY_PROJECT = gql /* GraphQL */ `
  query EnergyAssetsByProject($projectId: ID!, $first: Int, $after: String, $type: EnergyAssetType) {
    energyAssetsByProject(projectId: $projectId, first: $first, after: $after, type: $type) {
      edges {
        cursor
        node {
          id
          type
          capacityKw
          active
          createdAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
