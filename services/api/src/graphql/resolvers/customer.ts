import type { GraphQLContext } from "../context";
import type { Customer } from "@energy-portfolio/domain";

export const CustomerQueryResolvers = {
    customer: (
        _parent: unknown,
        args: { id: string },
        ctx: GraphQLContext
    ): Customer | null => {
        return ctx.data.customers.find((c: Customer) => c.id === args.id) || null;
    },

    customers: (
        _parent: unknown,
        _args: unknown,
        ctx: GraphQLContext
    ): Customer[] => {
        return ctx.data.customers;
    }
};