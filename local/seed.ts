/*
  Seed DynamoDB Local with sample data from the domain package.

  Usage:
    pnpm db:up
    pnpm seed               # create tables if missing and seed data
    pnpm seed --recreate    # delete and recreate tables, then seed

  Environment overrides:
    DDB_LOCAL_URL           # default http://localhost:8000
    AWS_REGION              # default us-east-1
    CUSTOMERS_TABLE         # default Customers
    PROJECTS_TABLE          # default Projects
    ENERGY_ASSETS_TABLE     # default EnergyAssets
*/

import {
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Import seed data from source to avoid needing a build
import { createSeedData } from "../packages/domain/src/factories";

type WriteRequest = { PutRequest: { Item: Record<string, unknown> } };

const endpoint = process.env.DDB_LOCAL_URL ?? "http://localhost:8000";
const region = process.env.AWS_REGION ?? "us-east-1";

const TABLE_CUSTOMERS = process.env.CUSTOMERS_TABLE ?? "Customers";
const TABLE_PROJECTS = process.env.PROJECTS_TABLE ?? "Projects";
const TABLE_ASSETS = process.env.ENERGY_ASSETS_TABLE ?? "EnergyAssets";

const recreate = process.argv.includes("--recreate");

const ddb = new DynamoDBClient({
  endpoint,
  region,
  credentials: { accessKeyId: "localAccessKey", secretAccessKey: "localSecretKey" },
});
const doc = DynamoDBDocumentClient.from(ddb, { marshallOptions: { removeUndefinedValues: true } });

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}

function errorName(e: unknown): string | undefined {
  if (typeof e === "object" && e !== null && "name" in e) {
    const n = (e as { name?: unknown }).name;
    return typeof n === "string" ? n : undefined;
  }
  return undefined;
}

async function tableExists(tableName: string): Promise<boolean> {
  try {
    const res = await ddb.send(new DescribeTableCommand({ TableName: tableName }));
    return Boolean(res.Table);
  } catch (err) {
    if (errorName(err) === "ResourceNotFoundException") return false;
    throw toError(err);
  }
}

async function deleteTableIfExists(tableName: string) {
  if (!(await tableExists(tableName))) return;
  await ddb.send(new DeleteTableCommand({ TableName: tableName }));
  // Wait until gone
  for (let i = 0; i < 20; i++) {
    const exists = await tableExists(tableName);
    if (!exists) return;
    await sleep(500);
  }
}

async function ensureTables() {
  if (recreate) {
    console.log("Recreating tables...");
    await deleteTableIfExists(TABLE_ASSETS);
    await deleteTableIfExists(TABLE_PROJECTS);
    await deleteTableIfExists(TABLE_CUSTOMERS);
  }

  await createCustomersTable();
  await createProjectsTable();
  await createAssetsTable();
}

async function createCustomersTable() {
  if (await tableExists(TABLE_CUSTOMERS)) {
    console.log(`Table exists: ${TABLE_CUSTOMERS}`);
    return;
  }
  console.log(`Creating table: ${TABLE_CUSTOMERS}`);
  try {
    await ddb.send(
      new CreateTableCommand({
        TableName: TABLE_CUSTOMERS,
        AttributeDefinitions: [
          { AttributeName: "id", AttributeType: "S" },
          { AttributeName: "createdAt", AttributeType: "S" },
        ],
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        // Simple GSI for time-ordered scans per potential future needs
        GlobalSecondaryIndexes: [
          {
            IndexName: "ByCreatedAt",
            KeySchema: [{ AttributeName: "createdAt", KeyType: "HASH" }],
            Projection: { ProjectionType: "ALL" },
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
          },
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      }),
    );
  } catch (err) {
    if (errorName(err) !== "ResourceInUseException") throw toError(err);
  }
  await waitForActive(TABLE_CUSTOMERS);
}

async function createProjectsTable() {
  if (await tableExists(TABLE_PROJECTS)) {
    console.log(`Table exists: ${TABLE_PROJECTS}`);
    return;
  }
  console.log(`Creating table: ${TABLE_PROJECTS}`);
  try {
    await ddb.send(
      new CreateTableCommand({
        TableName: TABLE_PROJECTS,
        AttributeDefinitions: [
          { AttributeName: "id", AttributeType: "S" },
          { AttributeName: "customerId", AttributeType: "S" },
          { AttributeName: "createdAt", AttributeType: "S" },
        ],
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        GlobalSecondaryIndexes: [
          {
            IndexName: "ByCustomer",
            KeySchema: [
              { AttributeName: "customerId", KeyType: "HASH" },
              { AttributeName: "createdAt", KeyType: "RANGE" },
            ],
            Projection: { ProjectionType: "ALL" },
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
          },
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      }),
    );
  } catch (err) {
    if (errorName(err) !== "ResourceInUseException") throw toError(err);
  }
  await waitForActive(TABLE_PROJECTS);
}

async function createAssetsTable() {
  if (await tableExists(TABLE_ASSETS)) {
    console.log(`Table exists: ${TABLE_ASSETS}`);
    return;
  }
  console.log(`Creating table: ${TABLE_ASSETS}`);
  try {
    await ddb.send(
      new CreateTableCommand({
        TableName: TABLE_ASSETS,
        AttributeDefinitions: [
          { AttributeName: "id", AttributeType: "S" },
          { AttributeName: "projectId", AttributeType: "S" },
          { AttributeName: "createdAt", AttributeType: "S" },
        ],
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        GlobalSecondaryIndexes: [
          {
            IndexName: "ByProject",
            KeySchema: [
              { AttributeName: "projectId", KeyType: "HASH" },
              { AttributeName: "createdAt", KeyType: "RANGE" },
            ],
            Projection: { ProjectionType: "ALL" },
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
          },
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      }),
    );
  } catch (err) {
    if (errorName(err) !== "ResourceInUseException") throw toError(err);
  }
  await waitForActive(TABLE_ASSETS);
}

async function waitForActive(tableName: string) {
  for (let i = 0; i < 40; i++) {
    const res = await ddb.send(new DescribeTableCommand({ TableName: tableName }));
    const status = res.Table?.TableStatus;
    if (status === "ACTIVE") return;
    await sleep(500);
  }
  throw new Error(`Table did not become ACTIVE: ${tableName}`);
}

async function seedData() {
  const { customers, projects, assets } = createSeedData();

  console.log("Seeding Customers...", customers.length);
  await batchPut(
    TABLE_CUSTOMERS,
    customers.map((c) => ({ ...c })),
  );

  console.log("Seeding Projects...", projects.length);
  await batchPut(
    TABLE_PROJECTS,
    projects.map((p) => ({ ...p })),
  );

  console.log("Seeding EnergyAssets...", assets.length);
  await batchPut(
    TABLE_ASSETS,
    assets.map((a) => ({ ...a })),
  );

  console.log("Seed complete.");
}

async function batchPut(tableName: string, items: Record<string, unknown>[]) {
  const MAX_BATCH = 25;
  for (let i = 0; i < items.length; i += MAX_BATCH) {
    const slice = items.slice(i, i + MAX_BATCH);
    const reqItems: WriteRequest[] = slice.map((Item) => ({ PutRequest: { Item } }));

    let unprocessed: Record<string, WriteRequest[]> | undefined = { [tableName]: reqItems };

    // Retry until all processed
    while (unprocessed && Object.keys(unprocessed).length > 0) {
      const cmd = new BatchWriteCommand({ RequestItems: unprocessed });
      const res = await doc.send(cmd);
      unprocessed = res.UnprocessedItems as Record<string, WriteRequest[]> | undefined;
      if (unprocessed && Object.keys(unprocessed).length > 0) await sleep(200);
    }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

console.log(`Using endpoint ${endpoint}, region ${region}`);
try {
  await ensureTables();
  await seedData();
} catch (err) {
  console.error("Seed failed:", toError(err));
  process.exit(1);
}
