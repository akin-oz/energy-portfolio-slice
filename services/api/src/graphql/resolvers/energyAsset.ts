import type { GraphQLContext } from "../context";
import type { EnergyAsset } from "@energy-portfolio/domain";
import { EnergyAssetType } from "@energy-portfolio/domain";
import { paginateByCreatedAt } from "../../utils/pagination";

interface AssetsArgs {
    projectId: string;
    first?: number;
    after?: string;
    type?: EnergyAssetType;
}

export const EnergyAssetQueryResolvers = {
    energyAssetsByProject: async (
        _parent: unknown,
        args: AssetsArgs,
        ctx: GraphQLContext
    ) => {
        const { projectId, type, first, after } = args;

        const items: EnergyAsset[] = await ctx.repos.assets.listByProject(projectId, { type });

        return paginateByCreatedAt(items, { pk: projectId, first, after });
    }
};
