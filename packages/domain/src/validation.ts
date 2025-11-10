import {
    Customer,
    Project,
    EnergyAsset,
    ProjectStatus,
    EnergyAssetType,
    ID
} from "./types";

export type ValidationResult<T> =
    | { ok: true; value: T }
    | { ok: false; errors: string[] };

function nonEmpty(value: string | undefined | null, field: string, errors: string[]) {
    if (!value || value.trim().length === 0) {
        errors.push(`${field} is required`);
    }
}

function positiveInt(value: number | undefined, field: string, errors: string[]) {
    if (value === undefined || Number.isNaN(value) || value <= 0) {
        errors.push(`${field} must be a positive number`);
    }
}

export interface CreateCustomerInput {
    name: string;
}

export interface CreateProjectInput {
    customerId: ID;
    name: string;
    status: ProjectStatus;
}

export interface CreateEnergyAssetInput {
    projectId: ID;
    type: EnergyAssetType;
    capacityKw: number;
}

export function validateCreateCustomerInput(
    input: CreateCustomerInput
): ValidationResult<CreateCustomerInput> {
    const errors: string[] = [];
    nonEmpty(input.name, "name", errors);

    return errors.length === 0
        ? {ok: true, value: input}
        : {ok: false, errors};
}

export function validateCreateProjectInput(
    input: CreateProjectInput
): ValidationResult<CreateProjectInput> {
    const errors: string[] = [];
    nonEmpty(input.customerId, "customerId", errors);
    nonEmpty(input.name, "name", errors);

    if (!Object.values(ProjectStatus).includes(input.status)) {
        errors.push("status is invalid");
    }

    return errors.length === 0
        ? {ok: true, value: input}
        : {ok: false, errors};
}

export function validateCreateEnergyAssetInput(
    input: CreateEnergyAssetInput
): ValidationResult<CreateEnergyAssetInput> {
    const errors: string[] = [];
    nonEmpty(input.projectId, "projectId", errors);

    if (!Object.values(EnergyAssetType).includes(input.type)) {
        errors.push("type is invalid");
    }

    positiveInt(input.capacityKw, "capacityKw", errors);

    return errors.length === 0
        ? {ok: true, value: input}
        : {ok: false, errors};
}

/**
 * Optional validators for existing records, used in repos or resolvers.
 */

export function assertCustomerExists(
    customer: Customer | undefined | null,
    id: ID
): void {
    if (!customer) {
        throw new Error(`Customer ${id} not found`);
    }
}

export function assertProjectExists(
    project: Project | undefined | null,
    id: ID
): void {
    if (!project) {
        throw new Error(`Project ${id} not found`);
    }
}

export function assertEnergyAssetExists(
    asset: EnergyAsset | undefined | null,
    id: ID
): void {
    if (!asset) {
        throw new Error(`EnergyAsset ${id} not found`);
    }
}