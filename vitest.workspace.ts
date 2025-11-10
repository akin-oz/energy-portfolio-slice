import {defineWorkspace} from "vitest/config";

export default defineWorkspace([
    "packages/domain/vitest.config.ts",
    "packages/shared/vitest.config.ts",
    "services/api/vitest.config.ts",
    "frontend/vitest.config.ts"
]);