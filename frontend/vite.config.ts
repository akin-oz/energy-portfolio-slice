import {defineConfig} from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@energy-portfolio/domain": path.resolve(__dirname, "../packages/domain/src"),
            "@energy-portfolio/shared": path.resolve(__dirname, "../packages/shared/src"),
            "@energy-portfolio/frontend": path.resolve(__dirname, "./src")
        }
    }
});