import { Customer, Project, EnergyAsset, ProjectStatus, EnergyAssetType, ID } from "./types";

let idCounter = 1;

function nextId(prefix: string): ID {
  return `${prefix}_${idCounter++}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createCustomer(params?: Partial<Customer>): Customer {
  return {
    id: params?.id ?? nextId("cust"),
    name: params?.name ?? "Sample Customer",
    contactName: params?.contactName ?? "Alex Manager",
    contactEmail: params?.contactEmail ?? "ops@example.com",
    country: params?.country ?? "DE",
    createdAt: params?.createdAt ?? nowIso(),
    updatedAt: params?.updatedAt ?? nowIso(),
  };
}

export function createProject(customerId: ID, params?: Partial<Project>): Project {
  return {
    id: params?.id ?? nextId("proj"),
    customerId,
    name: params?.name ?? "Sample Project",
    status: params?.status ?? ProjectStatus.Active,
    totalCapacityKw: params?.totalCapacityKw ?? 0,
    city: params?.city ?? "Berlin",
    country: params?.country ?? "DE",
    startDate: params?.startDate ?? nowIso(),
    endDate: params?.endDate ?? null,
    createdAt: params?.createdAt ?? nowIso(),
    updatedAt: params?.updatedAt ?? nowIso(),
  };
}

export function createEnergyAsset(projectId: ID, params?: Partial<EnergyAsset>): EnergyAsset {
  return {
    id: params?.id ?? nextId("asset"),
    projectId,
    type: params?.type ?? EnergyAssetType.Solar,
    name: params?.name ?? "PV Inverter",
    capacityKw: params?.capacityKw ?? 100,
    active: params?.active ?? false,
    manufacturer: params?.manufacturer ?? "GenericCo",
    model: params?.model ?? "Model-X",
    commissionedAt: params?.commissionedAt ?? null,
    createdAt: params?.createdAt ?? nowIso(),
    updatedAt: params?.updatedAt ?? nowIso(),
  };
}

/**
 * Simple seed set for local dev and tests.
 */
export function createSeedData() {
  const customerA = createCustomer({ name: "Northwind Energy GmbH" });
  const customerB = createCustomer({ name: "Brightfield Power Ltd" });

  const projA1 = createProject(customerA.id, {
    name: "Rooftop Solar Phase 1",
    status: ProjectStatus.Active,
  });
  const projA2 = createProject(customerA.id, {
    name: "Industrial Storage Pilot",
    status: ProjectStatus.Draft,
  });

  const projB1 = createProject(customerB.id, {
    name: "Onshore Wind Extension",
    status: ProjectStatus.Hold,
  });

  const assets: EnergyAsset[] = [
    createEnergyAsset(projA1.id, {
      type: EnergyAssetType.Solar,
      capacityKw: 250,
      active: true,
    }),
    createEnergyAsset(projA1.id, {
      type: EnergyAssetType.Solar,
      capacityKw: 180,
      active: true,
    }),
    createEnergyAsset(projA2.id, {
      type: EnergyAssetType.Storage,
      capacityKw: 500,
      active: false,
    }),
    createEnergyAsset(projB1.id, {
      type: EnergyAssetType.Wind,
      capacityKw: 1500,
      active: false,
    }),
  ];

  const customers = [customerA, customerB];
  const projects = [projA1, projA2, projB1];

  return { customers, projects, assets };
}
