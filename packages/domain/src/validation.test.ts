import { describe, it, expect } from "vitest";
import {
  validateCreateCustomerInput,
  validateCreateProjectInput,
  validateCreateEnergyAssetInput,
} from "./validation";
import { ProjectStatus, EnergyAssetType } from "./types";

describe("domain validation", () => {
  it("rejects empty customer name", () => {
    const res = validateCreateCustomerInput({ name: "" });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors).toContain("name is required");
  });

  it("validates project input and rejects invalid status", () => {
    const ok = validateCreateProjectInput({
      customerId: "cust_1",
      name: "Project A",
      status: ProjectStatus.Active,
    });
    expect(ok.ok).toBe(true);

    const bad = validateCreateProjectInput({
      customerId: "cust_1",
      name: "Project A",
      // @ts-expect-error: invalid enum value for test
      status: "INVALID" as unknown as ProjectStatus,
    });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.errors).toContain("status is invalid");
  });

  it("validates energy asset input and rejects invalid fields", () => {
    const ok = validateCreateEnergyAssetInput({
      projectId: "proj_1",
      type: EnergyAssetType.Solar,
      capacityKw: 10,
    });
    expect(ok.ok).toBe(true);

    const badType = validateCreateEnergyAssetInput({
      projectId: "proj_1",
      // @ts-expect-error: invalid enum value for test
      type: "BOGUS" as unknown as EnergyAssetType,
      capacityKw: 10,
    });
    expect(badType.ok).toBe(false);
    if (!badType.ok) expect(badType.errors).toContain("type is invalid");

    const badCapacity = validateCreateEnergyAssetInput({
      projectId: "proj_1",
      type: EnergyAssetType.Solar,
      capacityKw: 0,
    });
    expect(badCapacity.ok).toBe(false);
    if (!badCapacity.ok) expect(badCapacity.errors).toContain("capacityKw must be a positive number");
  });
});

