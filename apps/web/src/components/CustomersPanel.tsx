import { useQuery } from "@apollo/client";
import { CUSTOMERS } from "../graphql/queries";
import type { CustomersQuery, CustomersVars } from "../graphql/types";

export interface CustomersPanelProps {
  readonly selectedCustomer: string | null;
  readonly onSelectCustomer: (id: string) => void;
}

export function CustomersPanel({ selectedCustomer, onSelectCustomer }: CustomersPanelProps) {
  const { data, loading, error, refetch, fetchMore } = useQuery<CustomersQuery, CustomersVars>(
    CUSTOMERS,
    {
      variables: { first: 20 },
      notifyOnNetworkStatusChange: true,
    },
  );

  return (
    <section className="panel">
      <h2>Customers</h2>
      {loading && <div className="loading">Loading customers…</div>}
      {error && (
        <div className="error">
          Failed to load customers. <button onClick={() => refetch()}>Retry</button>
        </div>
      )}
      <div className="list">
        {data?.customers?.edges?.map((e) => {
          const c = e.node;
          return (
            <button
              key={c.id}
              type="button"
              className={"item " + (selectedCustomer === c.id ? "selected" : "")}
              onClick={() => onSelectCustomer(c.id)}
              aria-pressed={selectedCustomer === c.id}
            >
              <span className="row" style={{ justifyContent: "space-between" }}>
                <span>{c.name}</span>
                <code className="muted">{c.id}</code>
              </span>
            </button>
          );
        })}
        {!loading && !error && (!data || data.customers.edges.length === 0) && (
          <div className="muted">No customers.</div>
        )}
      </div>
      {data?.customers?.pageInfo?.hasNextPage && (
        <div style={{ marginTop: 8 }}>
          <button
            onClick={() =>
              fetchMore({
                variables: { first: 20, after: data.customers.pageInfo.endCursor ?? undefined },
                updateQuery: (
                  prev: CustomersQuery,
                  { fetchMoreResult }: { fetchMoreResult?: CustomersQuery },
                ) => {
                  if (!fetchMoreResult) return prev;
                  return {
                    ...fetchMoreResult,
                    customers: {
                      ...fetchMoreResult.customers,
                      edges: [...(prev.customers?.edges ?? []), ...fetchMoreResult.customers.edges],
                    },
                  };
                },
              })
            }
          >
            Load more
          </button>
        </div>
      )}
    </section>
  );
}
