import {
    createSeedData,
    Customer,
    Project,
    EnergyAsset
} from "@energy-portfolio/domain";

export interface DataSource {
    customers: Customer[];
    projects: Project[];
    assets: EnergyAsset[];
}

const seed = createSeedData();

export interface GraphQLContext {
    data: DataSource;
}

export function createContext(): GraphQLContext {
    return { data: seed };
}