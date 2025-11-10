import { describe, it, expect } from "vitest";
import {
  createCustomer,
  createProject,
  createEnergyAsset,
  createSeedData,
} from "./factories";
import { ProjectStatus, EnergyAssetType } from "./types";

describe("factories", () => {
  it("creates customer, project, and energy asset with sensible defaults", () => {
    const c = createCustomer();
    expect(c.id).toMatch(/^cust_/);
    expect(c.name).toBeTruthy();
    expect(new Date(c.createdAt).toString()).not.toBe("Invalid Date");

    const p = createProject(c.id, { status: ProjectStatus.Draft });
    expect(p.customerId).toBe(c.id);
    expect(Object.values(ProjectStatus)).toContain(p.status);
    expect(new Date(p.createdAt).toString()).not.toBe("Invalid Date");

    const a = createEnergyAsset(p.id, { type: EnergyAssetType.Wind, capacityKw: 123 });
    expect(a.projectId).toBe(p.id);
    expect(a.capacityKw).toBe(123);
    expect(Object.values(EnergyAssetType)).toContain(a.type);
  });

  it("provides deterministic seed arrays with expected sizes", () => {
    const seed = createSeedData();
    expect(seed.customers.length).toBeGreaterThanOrEqual(2);
    expect(seed.projects.length).toBeGreaterThanOrEqual(3);
    expect(seed.assets.length).toBeGreaterThanOrEqual(4);
  });
});

