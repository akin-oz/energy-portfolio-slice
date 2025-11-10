import type { GraphQLContext } from "../context";
import type { Project } from "@energy-portfolio/domain";
import { ProjectStatus } from "@energy-portfolio/domain";
import { paginateByCreatedAt } from "../../utils/pagination";
import { GraphQLError } from "graphql";

interface ProjectsArgs {
  customerId: string;
  first?: number;
  after?: string;
  status?: ProjectStatus;
}

export const ProjectQueryResolvers = {
  projectsByCustomer: async (_parent: unknown, args: ProjectsArgs, ctx: GraphQLContext) => {
    const { customerId, status, first, after } = args;
    try {
      const items: Project[] = await ctx.repos.projects.listByCustomer(customerId, { status });
      return paginateByCreatedAt(items, { pk: customerId, first, after });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("Invalid cursor")) {
        throw new GraphQLError("Invalid cursor", { extensions: { code: "VALIDATION_ERROR" } });
      }
      throw err;
    }
  },
};
