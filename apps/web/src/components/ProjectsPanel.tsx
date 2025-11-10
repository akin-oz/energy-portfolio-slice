import React from "react";
import { useQuery } from "@apollo/client";
import { PROJECTS_BY_CUSTOMER } from "../graphql/queries";
import type { ProjectStatus } from "../types";
import type { ProjectsByCustomerQuery, ProjectsByCustomerVars } from "../graphql/types";

export interface ProjectsPanelProps {
  readonly customerId: string | null;
  readonly selectedProject: string | null;
  readonly onSelectProject: (id: string) => void;
  readonly status?: ProjectStatus;
  readonly onChangeStatus: (s: ProjectStatus | "") => void;
}

export function ProjectsPanel({
  customerId,
  selectedProject,
  onSelectProject,
  status,
  onChangeStatus,
}: ProjectsPanelProps) {
  const variables = React.useMemo<ProjectsByCustomerVars | undefined>(() => {
    if (!customerId) return undefined;
    return {
      customerId,
      first: 20,
      status: status ?? undefined,
    };
  }, [customerId, status]);

  const { data, loading, error, refetch, fetchMore } = useQuery<
    ProjectsByCustomerQuery,
    ProjectsByCustomerVars
  >(PROJECTS_BY_CUSTOMER, {
    variables,
    skip: !customerId,
    notifyOnNetworkStatusChange: true,
  });

  const edges = data?.projectsByCustomer?.edges ?? [];
  const pageInfo = data?.projectsByCustomer?.pageInfo;

  return (
    <section className="panel">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h2>Projects {customerId ? "for customer" : ""}</h2>
        <div className="row">
          <label className="muted" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            value={status ?? ""}
            onChange={(e) => onChangeStatus((e.target.value || "") as ProjectStatus | "")}
            disabled={!customerId}
          >
            <option value="">All</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="HOLD">Hold</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>
      {!customerId && <div className="muted">Select a customer to view projects.</div>}
      {customerId && loading && <div className="loading">Loading projects…</div>}
      {customerId && error && (
        <div className="error">
          Failed to load projects. <button onClick={() => refetch()}>Retry</button>
        </div>
      )}
      <div className="list">
        {edges.map((e) => {
          const p = e.node;
          return (
            <button
              key={p.id}
              type="button"
              className={"item " + (selectedProject === p.id ? "selected" : "")}
              onClick={() => onSelectProject(p.id)}
              aria-pressed={selectedProject === p.id}
            >
              <span className="row" style={{ justifyContent: "space-between" }}>
                <span>{p.name}</span>
                <span className="muted">{p.status}</span>
              </span>
            </button>
          );
        })}
        {customerId && !loading && !error && edges.length === 0 && (
          <div className="muted">No projects.</div>
        )}
      </div>
      {customerId && pageInfo?.hasNextPage && (
        <div style={{ marginTop: 8 }}>
          <button
            onClick={() =>
              fetchMore({
                variables: {
                  ...(variables as ProjectsByCustomerVars),
                  after: pageInfo.endCursor ?? undefined,
                },
                updateQuery: (
                  prev: ProjectsByCustomerQuery,
                  { fetchMoreResult }: { fetchMoreResult?: ProjectsByCustomerQuery },
                ) => {
                  if (!fetchMoreResult) return prev;
                  return {
                    ...fetchMoreResult,
                    projectsByCustomer: {
                      ...fetchMoreResult.projectsByCustomer,
                      edges: [
                        ...(prev.projectsByCustomer?.edges ?? []),
                        ...fetchMoreResult.projectsByCustomer.edges,
                      ],
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
