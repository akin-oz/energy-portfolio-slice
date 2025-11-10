import {createSeedData} from "@energy-portfolio/domain";
import type {Repositories} from "../repository/interfaces";
import {
    InMemoryAssetsRepo,
    InMemoryCustomersRepo,
    InMemoryProjectsRepo
} from "../repository/inMemory";

const seed = createSeedData();

export interface GraphQLContext {
    repos: Repositories;
}

export function createContext(): GraphQLContext {
    const customers = new InMemoryCustomersRepo(seed);
    const projects = new InMemoryProjectsRepo(seed);
    const assets = new InMemoryAssetsRepo(seed);
    return {repos: {customers, projects, assets}};
}
