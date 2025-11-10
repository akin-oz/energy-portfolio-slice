import type { GraphQLContext } from "../context";
import type { Project } from "@energy-portfolio/domain";
import { ProjectStatus } from "@energy-portfolio/domain";

interface ProjectsArgs {
    customerId: string;
    first?: number;
    after?: string;
    status?: ProjectStatus;
}

export const ProjectQueryResolvers = {
    projectsByCustomer: (
        _parent: unknown,
        args: ProjectsArgs,
        ctx: GraphQLContext
    ) => {
        const { customerId, status } = args;

        let items: Project[] = ctx.data.projects.filter(
            (p: Project) => p.customerId === customerId
        );

        if (status) {
            items = items.filter((p: Project) => p.status === status);
        }

        const edges = items.map(project => ({
            cursor: project.id,
            node: project
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