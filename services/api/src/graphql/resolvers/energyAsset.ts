import type { GraphQLContext } from "../context";
import type { EnergyAsset } from "@energy-portfolio/domain";
import { EnergyAssetType } from "@energy-portfolio/domain";

interface AssetsArgs {
    projectId: string;
    first?: number;
    after?: string;
    type?: EnergyAssetType;
}

export const EnergyAssetQueryResolvers = {
    energyAssetsByProject: (
        _parent: unknown,
        args: AssetsArgs,
        ctx: GraphQLContext
    ) => {
        const { projectId, type } = args;

        let items: EnergyAsset[] = ctx.data.assets.filter(
            (a: EnergyAsset) => a.projectId === projectId
        );

        if (type) {
            items = items.filter((a: EnergyAsset) => a.type === type);
        }

        const edges = items.map(asset => ({
            cursor: asset.id,
            node: asset
        }));

        const endCursor = edges.length > 0 ? edges.at(-1)?.cursor : null;

        return {
            edges,
            pageInfo: {
                endCursor,
                hasNextPage: false
            }
        };
    }
};