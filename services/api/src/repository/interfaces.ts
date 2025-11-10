import type {
  Customer,
  Project,
  EnergyAsset,
  ProjectStatus,
  EnergyAssetType
} from "@energy-portfolio/domain";

export interface CustomersRepository {
  getById(id: string): Promise<Customer | null>;
  list(): Promise<Customer[]>;
}

export interface ProjectsListFilter {
  status?: ProjectStatus;
}

export interface ProjectsRepository {
  listByCustomer(customerId: string, filter?: ProjectsListFilter): Promise<Project[]>;
}

export interface EnergyAssetsListFilter {
  type?: EnergyAssetType;
}

export interface EnergyAssetsRepository {
  listByProject(projectId: string, filter?: EnergyAssetsListFilter): Promise<EnergyAsset[]>;
}

export interface Repositories {
  customers: CustomersRepository;
  projects: ProjectsRepository;
  assets: EnergyAssetsRepository;
}

