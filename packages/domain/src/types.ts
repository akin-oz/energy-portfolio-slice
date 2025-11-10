export type ID = string;

export enum ProjectStatus {
    Draft = "DRAFT",
    Active = "ACTIVE",
    Hold = "HOLD",
    Closed = "CLOSED"
}

export enum EnergyAssetType {
    Solar = "SOLAR",
    Wind = "WIND",
    Storage = "STORAGE",
    Other = "OTHER"
}

export interface Customer {
    id: ID;
    name: string;
    createdAt: string;
}

export interface Project {
    id: ID;
    customerId: ID;
    name: string;
    status: ProjectStatus;
    createdAt: string;
}

export interface EnergyAsset {
    id: ID;
    projectId: ID;
    type: EnergyAssetType;
    capacityKw: number;
    active: boolean;
    createdAt: string;
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