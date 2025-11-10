import { useQuery } from "@apollo/client";
import { CUSTOMERS } from "../graphql/queries";

export interface CustomersPanelProps {
  readonly selectedCustomer: string | null;
  readonly onSelectCustomer: (id: string) => void;
}

export function CustomersPanel({ selectedCustomer, onSelectCustomer }: CustomersPanelProps) {
  const { data, loading, error, refetch } = useQuery(CUSTOMERS);

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
        {data?.customers?.map((c: any) => (
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
        ))}
        {!loading && !error && (!data || data.customers.length === 0) && (
          <div className="muted">No customers.</div>
        )}
      </div>
    </section>
  );
}
