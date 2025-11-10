import {readFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {ApolloServer} from "@apollo/server";
import resolvers from "../graphql/resolvers";
import {createSeedData} from "@energy-portfolio/domain";
import {
    InMemoryAssetsRepo,
    InMemoryCustomersRepo,
    InMemoryProjectsRepo
} from "../repository/inMemory";
import type {Repositories} from "../repository/interfaces";
import type {GraphQLContext} from "../graphql/context";

type ProjectsQueryData = {
    projectsByCustomer: {
        edges: Array<{ cursor: string; node: { id: string; status: string; customerId: string; createdAt: string } }>;
        pageInfo: { endCursor: string | null; hasNextPage: boolean };
    };
};

type AssetsQueryData = {
    energyAssetsByProject: {
        edges: Array<{ cursor: string; node: { id: string; type: string; projectId: string; createdAt: string } }>;
        pageInfo: { endCursor: string | null; hasNextPage: boolean };
    };
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadTypeDefs(): string {
    const schemaPath = path.resolve(__dirname, "../graphql/schema.graphql");
    return readFileSync(schemaPath, "utf8");
}

async function makeServerWithSeed() {
    const seed = createSeedData();
    const repos: Repositories = {
        customers: new InMemoryCustomersRepo(seed),
        projects: new InMemoryProjectsRepo(seed),
        assets: new InMemoryAssetsRepo(seed)
    };
    const typeDefs = loadTypeDefs();
    const server = new ApolloServer<GraphQLContext>({typeDefs, resolvers});
    await server.start();
    return {server, repos, seed};
}

function isObj(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null;
}

function getData<T>(result: unknown): T {
    if (isObj(result) && "body" in result && isObj((result as Record<string, unknown>).body)) {
        const body = (result as { body: { kind?: unknown; singleResult?: unknown } }).body;
        if (body.kind === "single" && isObj(body.singleResult) && "data" in body.singleResult) {
            return (body.singleResult as { data: T }).data;
        }
    }
    if (isObj(result) && "data" in result) {
        return (result as { data: T }).data;
    }
    throw new Error("Unexpected executeOperation result shape");
}

describe("GraphQL pagination and filters", () => {
    it("paginates projects by customer with status filter", async () => {
        const {server, seed, repos} = await makeServerWithSeed();
        try {
            const customerId = seed.customers[0].id; // has 2 projects (ACTIVE, DRAFT)
            const query = /* GraphQL */ `
        query($customerId: ID!, $first: Int, $after: String, $status: ProjectStatus) {
          projectsByCustomer(customerId: $customerId, first: $first, after: $after, status: $status) {
            edges { cursor node { id status customerId createdAt } }
            pageInfo { endCursor hasNextPage }
          }
        }
      `;

            // First page with filter ACTIVE
            let res = await server.executeOperation({
                query,
                variables: {customerId, first: 1, status: "ACTIVE"}
            }, {contextValue: {repos}});
            let data = getData<ProjectsQueryData>(res);
            expect(data.projectsByCustomer.edges).toHaveLength(1);
            expect(data.projectsByCustomer.edges[0].node.status).toBe("ACTIVE");
            expect(data.projectsByCustomer.pageInfo.hasNextPage).toBe(false);

            // Without filter, expect 2 projects and proper pagination
            res = await server.executeOperation({
                query,
                variables: {customerId, first: 1}
            }, {contextValue: {repos}});
            data = getData<ProjectsQueryData>(res);
            expect(data.projectsByCustomer.edges).toHaveLength(1);
            const cursor = data.projectsByCustomer.pageInfo.endCursor;
            expect(cursor).toBeTruthy();
            expect(data.projectsByCustomer.pageInfo.hasNextPage).toBe(true);

            // Next page
            const res2 = await server.executeOperation({
                query,
                variables: {customerId, first: 10, after: cursor}
            }, {contextValue: {repos}});
            const data2 = getData<ProjectsQueryData>(res2);
            expect(data2.projectsByCustomer.edges.length).toBeGreaterThanOrEqual(1);
            expect(data2.projectsByCustomer.pageInfo.hasNextPage).toBe(false);
        } finally {
            await server.stop();
        }
    });

    it("paginates energy assets by project with type filter", async () => {
        const {server, seed, repos} = await makeServerWithSeed();
        try {
            const projectWithTwoSolars = seed.projects.find(p => p.name.includes("Rooftop"))!;
            const projectId = projectWithTwoSolars.id;

            const query = /* GraphQL */ `
        query($projectId: ID!, $first: Int, $after: String, $type: EnergyAssetType) {
          energyAssetsByProject(projectId: $projectId, first: $first, after: $after, type: $type) {
            edges { cursor node { id type projectId createdAt } }
            pageInfo { endCursor hasNextPage }
          }
        }
      `;

            // Filter by SOLAR, there are 2 assets; paginate 1 by 1
            let res = await server.executeOperation({
                query,
                variables: {projectId, first: 1, type: "SOLAR"}
            }, {contextValue: {repos}});
            let data = getData<AssetsQueryData>(res);
            expect(data.energyAssetsByProject.edges).toHaveLength(1);
            expect(data.energyAssetsByProject.edges[0].node.type).toBe("SOLAR");
            const cursor = data.energyAssetsByProject.pageInfo.endCursor;
            expect(data.energyAssetsByProject.pageInfo.hasNextPage).toBe(true);

            // Next page
            const res2 = await server.executeOperation({
                query,
                variables: {projectId, first: 10, after: cursor, type: "SOLAR"}
            }, {contextValue: {repos}});
            const data2 = getData<AssetsQueryData>(res2);
            expect(data2.energyAssetsByProject.edges.length).toBeGreaterThanOrEqual(1);
            expect(data2.energyAssetsByProject.pageInfo.hasNextPage).toBe(false);

            // STORAGE type on the storage project should be 1
            const storageProject = seed.projects.find(p => p.name.includes("Storage"))!;
            const res3 = await server.executeOperation({
                query,
                variables: {projectId: storageProject.id, type: "STORAGE"}
            }, {contextValue: {repos}});
            const data3 = getData<AssetsQueryData>(res3);
            expect(data3.energyAssetsByProject.edges).toHaveLength(1);
            expect(data3.energyAssetsByProject.edges[0].node.type).toBe("STORAGE");
        } finally {
            await server.stop();
        }
    });
});
