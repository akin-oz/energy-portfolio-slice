export type ID = string;

export enum ProjectStatus {
  Draft = "DRAFT",
  Active = "ACTIVE",
  Hold = "HOLD",
  Closed = "CLOSED",
}

export enum EnergyAssetType {
  Solar = "SOLAR",
  Wind = "WIND",
  Storage = "STORAGE",
  Other = "OTHER",
}

export interface Customer {
  id: ID;
  name: string;
  contactName?: string;
  contactEmail?: string;
  country?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Project {
  id: ID;
  customerId: ID;
  name: string;
  status: ProjectStatus;
  totalCapacityKw?: number;
  city?: string;
  country?: string;
  startDate?: string;
  endDate?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface EnergyAsset {
  id: ID;
  projectId: ID;
  type: EnergyAssetType;
  name?: string;
  capacityKw: number;
  active: boolean;
  manufacturer?: string;
  model?: string;
  commissionedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Aggregate shapes used by the app and tests.
 */
export interface CustomerWithProjects extends Customer {
  projects: Project[];
}

export interface ProjectWithAssets extends Project {
  energyAssets: EnergyAsset[];
}
