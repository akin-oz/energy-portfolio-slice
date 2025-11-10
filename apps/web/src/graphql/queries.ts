import { gql } from "@apollo/client";

export const CUSTOMERS = gql /* GraphQL */ `
  query Customers {
    customers {
      id
      name
      createdAt
    }
  }
`;

export const PROJECTS_BY_CUSTOMER = gql /* GraphQL */ `
  query ProjectsByCustomer($customerId: ID!, $first: Int, $status: ProjectStatus) {
    projectsByCustomer(customerId: $customerId, first: $first, status: $status) {
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
  query EnergyAssetsByProject($projectId: ID!, $first: Int, $type: EnergyAssetType) {
    energyAssetsByProject(projectId: $projectId, first: $first, type: $type) {
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
