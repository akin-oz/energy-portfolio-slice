import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import resolvers from "./resolvers";
import { createContext } from "./context";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadTypeDefs(): string {
  const schemaPath = path.join(__dirname, "schema.graphql");
  return readFileSync(schemaPath, "utf8");
}

export async function startServer() {
  const typeDefs = loadTypeDefs();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: Number(process.env.PORT) || 4000 },
    context: async () => createContext(),
  });

  console.log(`GraphQL server ready at ${url}`);
}

if (process.env.NODE_ENV !== "test") {
  await startServer();
}
