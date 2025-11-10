import type { GraphQLContext } from "../context";
import type { Customer } from "@energy-portfolio/domain";

export const CustomerQueryResolvers = {
    customer: (
        _parent: unknown,
        args: { id: string },
        ctx: GraphQLContext
    ): Promise<Customer | null> => ctx.repos.customers.getById(args.id),

    customers: (
        _parent: unknown,
        _args: unknown,
        ctx: GraphQLContext
    ): Promise<Customer[]> => ctx.repos.customers.list()
};
