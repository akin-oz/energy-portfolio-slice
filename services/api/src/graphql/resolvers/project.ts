import type {GraphQLContext} from "../context";
import type {Project} from "@energy-portfolio/domain";
import {ProjectStatus} from "@energy-portfolio/domain";
import {paginateByCreatedAt} from "../../utils/pagination";

interface ProjectsArgs {
    customerId: string;
    first?: number;
    after?: string;
    status?: ProjectStatus;
}

export const ProjectQueryResolvers = {
    projectsByCustomer: async (
        _parent: unknown,
        args: ProjectsArgs,
        ctx: GraphQLContext
    ) => {
        const {customerId, status, first, after} = args;

        const items: Project[] = await ctx.repos.projects.listByCustomer(customerId, {status});

        return paginateByCreatedAt(items, {pk: customerId, first, after});
    }
};
