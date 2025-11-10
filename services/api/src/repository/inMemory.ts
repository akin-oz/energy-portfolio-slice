import type {
  Customer,
  Project,
  EnergyAsset,
} from "@energy-portfolio/domain";
import type {
  CustomersRepository,
  ProjectsRepository,
  EnergyAssetsRepository,
  ProjectsListFilter,
  EnergyAssetsListFilter
} from "./interfaces";

export interface InMemoryDataSource {
  customers: Customer[];
  projects: Project[];
  assets: EnergyAsset[];
}

export class InMemoryCustomersRepo implements CustomersRepository {
  constructor(private readonly data: InMemoryDataSource) {}

  async getById(id: string): Promise<Customer | null> {
    return this.data.customers.find((c) => c.id === id) || null;
  }

  async list(): Promise<Customer[]> {
    return this.data.customers;
  }
}

export class InMemoryProjectsRepo implements ProjectsRepository {
  constructor(private readonly data: InMemoryDataSource) {}

  async listByCustomer(customerId: string, filter?: ProjectsListFilter): Promise<Project[]> {
    let items = this.data.projects
      .filter((p) => p.customerId === customerId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (filter?.status) items = items.filter((p) => p.status === filter.status);
    return items;
  }
}

export class InMemoryAssetsRepo implements EnergyAssetsRepository {
  constructor(private readonly data: InMemoryDataSource) {}

  async listByProject(projectId: string, filter?: EnergyAssetsListFilter): Promise<EnergyAsset[]> {
    let items = this.data.assets
      .filter((a) => a.projectId === projectId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (filter?.type) items = items.filter((a) => a.type === filter.type);
    return items;
  }
}
