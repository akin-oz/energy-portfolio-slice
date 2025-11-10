import type { GraphQLContext } from "../context";
import type { Customer } from "@energy-portfolio/domain";
import { paginateByCreatedAt } from "../../utils/pagination";
import { GraphQLError } from "graphql";

export const CustomerQueryResolvers = {
  customer: (
    _parent: unknown,
    args: { id: string },
    ctx: GraphQLContext,
  ): Promise<Customer | null> => ctx.repos.customers.getById(args.id),

  customers: async (
    _parent: unknown,
    args: { first?: number; after?: string | null },
    ctx: GraphQLContext,
  ) => {
    try {
      const items: Customer[] = await ctx.repos.customers.list();
      return paginateByCreatedAt(items, {
        pk: "CUSTOMERS",
        first: args.first,
        after: args.after ?? undefined,
      });
    } catch (err) {
      // Normalize invalid cursor errors for clients
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("Invalid cursor")) {
        throw new GraphQLError("Invalid cursor", { extensions: { code: "VALIDATION_ERROR" } });
      }
      throw err;
    }
  },
};
