import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ApolloServer } from "@apollo/server";
import resolvers from "../graphql/resolvers";
import { createSeedData } from "@energy-portfolio/domain";
import {
  InMemoryAssetsRepo,
  InMemoryCustomersRepo,
  InMemoryProjectsRepo,
} from "../repository/inMemory";
import type { Repositories } from "../repository/interfaces";
import type { GraphQLContext } from "../graphql/context";

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
    assets: new InMemoryAssetsRepo(seed),
  };
  const typeDefs = loadTypeDefs();
  const server = new ApolloServer<GraphQLContext>({ typeDefs, resolvers });
  await server.start();
  return { server, repos, seed };
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

type GQLError = { message: string; extensions?: { code?: string } };
type SingleResult<TData> = { data?: TData; errors?: GQLError[] };

function getSingleResult<TData>(result: unknown): SingleResult<TData> {
  if (isObj(result) && "body" in result && isObj((result as Record<string, unknown>).body)) {
    const body = (result as { body: { kind?: unknown; singleResult?: unknown } }).body;
    if (body.kind === "single" && isObj(body.singleResult)) {
      return body.singleResult as SingleResult<TData>;
    }
  }
  if (isObj(result)) return result as SingleResult<TData>;
  throw new Error("Unexpected executeOperation result shape");
}

describe("customers connection + not found", () => {
  it("returns customers connection with edges and pageInfo", async () => {
    const { server, repos } = await makeServerWithSeed();
    try {
      const query = /* GraphQL */ `
        query ($first: Int, $after: String) {
          customers(first: $first, after: $after) {
            edges { cursor node { id name createdAt } }
            pageInfo { endCursor hasNextPage }
          }
        }
      `;

      const res1 = await server.executeOperation(
        { query, variables: { first: 1 } },
        { contextValue: { repos } },
      );
      type CustomersData = {
        customers: {
          edges: Array<{ cursor: string; node: { id: string; name: string; createdAt: string } }>;
          pageInfo: { endCursor: string | null; hasNextPage: boolean };
        };
      };
      const sr1 = getSingleResult<CustomersData>(res1);
      expect(sr1.errors).toBeUndefined();
      expect(sr1.data.customers.edges.length).toBe(1);
      const cursor = sr1.data.customers.pageInfo.endCursor;
      expect(cursor).toBeTruthy();
      expect(sr1.data.customers.pageInfo.hasNextPage).toBe(true);

      const res2 = await server.executeOperation(
        { query, variables: { first: 10, after: cursor } },
        { contextValue: { repos } },
      );
      const sr2 = getSingleResult<CustomersData>(res2);
      expect(sr2.errors).toBeUndefined();
      expect(sr2.data.customers.edges.length).toBeGreaterThanOrEqual(1);
    } finally {
      await server.stop();
    }
  });

  it("returns NOT_FOUND error when customer is missing", async () => {
    const { server, repos } = await makeServerWithSeed();
    try {
      const query = /* GraphQL */ `
        query ($id: ID!) {
          customer(id: $id) { id }
        }
      `;

      const res = await server.executeOperation(
        { query, variables: { id: "does_not_exist" } },
        { contextValue: { repos } },
      );
      type CustomerById = { customer: { id: string } | null };
      const sr = getSingleResult<CustomerById>(res);
      expect(sr.errors?.[0].message).toBe("Customer not found");
      expect(sr.errors?.[0].extensions?.code).toBe("NOT_FOUND");
      // GraphQL spec: data is still present with null for the field when an error is thrown
      expect(sr.data?.customer).toBeNull();
    } finally {
      await server.stop();
    }
  });
});
