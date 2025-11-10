import type { GraphQLContext } from "../context";
import type { EnergyAsset } from "@energy-portfolio/domain";
import { EnergyAssetType } from "@energy-portfolio/domain";
import { paginateByCreatedAt } from "../../utils/pagination";
import { GraphQLError } from "graphql";

interface AssetsArgs {
  projectId: string;
  first?: number;
  after?: string;
  type?: EnergyAssetType;
}

export const EnergyAssetQueryResolvers = {
  energyAssetsByProject: async (_parent: unknown, args: AssetsArgs, ctx: GraphQLContext) => {
    const { projectId, type, first, after } = args;

    try {
      const items: EnergyAsset[] = await ctx.repos.assets.listByProject(projectId, { type });
      return paginateByCreatedAt(items, { pk: projectId, first, after });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("Invalid cursor")) {
        throw new GraphQLError("Invalid cursor", { extensions: { code: "VALIDATION_ERROR" } });
      }
      throw err;
    }
  },
};
