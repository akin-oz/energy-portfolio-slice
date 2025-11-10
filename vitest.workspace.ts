import {defineWorkspace} from "vitest/config";

export default defineWorkspace([
    "packages/domain/vitest.config.ts",
    "packages/shared/vitest.config.ts",
    "services/api/vitest.config.ts",
    "apps/web/vitest.config.ts"
]);