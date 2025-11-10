import type { ProjectStatus, EnergyAssetType } from "../types";

// Customers query
export interface CustomersVars {
  first?: number;
  after?: string;
}

export interface CustomersQuery {
  customers: {
    edges: Array<{
      cursor: string;
      node: {
        id: string;
        name: string;
        createdAt: string;
      };
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

// Projects by customer
export interface ProjectsByCustomerVars {
  customerId: string;
  first?: number;
  after?: string;
  status?: ProjectStatus;
}

export interface ProjectsByCustomerQuery {
  projectsByCustomer: {
    edges: Array<{
      cursor: string;
      node: {
        id: string;
        name: string;
        status: ProjectStatus;
        createdAt: string;
      };
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

// Assets by project
export interface AssetsByProjectVars {
  projectId: string;
  first?: number;
  after?: string;
  type?: EnergyAssetType;
}

export interface AssetsByProjectQuery {
  energyAssetsByProject: {
    edges: Array<{
      cursor: string;
      node: {
        id: string;
        type: EnergyAssetType;
        capacityKw: number;
        active: boolean;
        createdAt: string;
      };
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}
