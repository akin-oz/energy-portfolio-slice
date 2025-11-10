import {defineConfig} from "vitest/config";
import path from "node:path";
import {fileURLToPath} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    test: {
        environment: "node",
        globals: true,
        include: ["src/**/tests/**/*.test.ts", "src/**/*.test.ts"]
    },
    resolve: {
        alias: {
            "@energy-portfolio/domain": path.resolve(__dirname, "../../packages/domain/src"),
            "@energy-portfolio/shared": path.resolve(__dirname, "../../packages/shared/src")
        }
    }
});
