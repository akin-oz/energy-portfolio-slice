import React from "react";
import {useQuery} from "@apollo/client";
import {ASSETS_BY_PROJECT} from "../graphql/queries";
import type {EnergyAssetType} from "../types";

export interface AssetsPanelProps {
  readonly projectId: string | null;
  readonly type?: EnergyAssetType;
  readonly onChangeType: (t: EnergyAssetType | "") => void;
}

export function AssetsPanel({projectId, type, onChangeType}: AssetsPanelProps) {
    const variables: any = React.useMemo(() => ({
        projectId,
        first: 20,
        type: type ?? null,
    }), [projectId, type]);

    const {data, loading, error, refetch, fetchMore} = useQuery(ASSETS_BY_PROJECT, {
        variables,
        skip: !projectId,
        notifyOnNetworkStatusChange: true,
    });

    const edges = data?.energyAssetsByProject?.edges ?? [];
    const pageInfo = data?.energyAssetsByProject?.pageInfo;

    return (
        <section className="panel">
            <div className="row" style={{justifyContent: "space-between"}}>
                <h2>Assets {projectId ? "for project" : ""}</h2>
                <div className="row">
                    <label className="muted" htmlFor="assetType">Type</label>
                    <select
                        id="assetType"
                        value={type ?? ""}
                        onChange={(e) => onChangeType((e.target.value || "") as EnergyAssetType | "")}
                        disabled={!projectId}
                    >
                        <option value="">All</option>
                        <option value="SOLAR">Solar</option>
                        <option value="WIND">Wind</option>
                        <option value="STORAGE">Storage</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
            </div>
            {!projectId && <div className="muted">Select a project to view assets.</div>}
            {projectId && loading && <div className="loading">Loading assets…</div>}
            {projectId && error && (
                <div className="error">
                    Failed to load assets. <button onClick={() => refetch()}>Retry</button>
                </div>
            )}
            <div className="list">
                {edges.map((e: any) => {
                    const a = e.node;
                    return (
                        <div key={a.id} className="item">
                            <div className="row" style={{justifyContent: "space-between"}}>
                                <span>{a.type}</span>
                                <span className="muted">{a.id}</span>
                            </div>
                            <div className="row" style={{justifyContent: "space-between", marginTop: 4}}>
                                <span className="muted">Capacity</span>
                                <span>{a.capacityKw} kW</span>
                            </div>
                            <div className="row" style={{justifyContent: "space-between", marginTop: 2}}>
                                <span className="muted">Active</span>
                                <span>{a.active ? "Yes" : "No"}</span>
                            </div>
                        </div>
                    );
                })}
                {projectId && !loading && !error && edges.length === 0 && (
                    <div className="muted">No assets.</div>
                )}
            </div>
            {projectId && pageInfo?.hasNextPage && (
                <div style={{marginTop: 8}}>
                    <button
                        onClick={() => fetchMore({
                            variables: {
                                ...variables,
                                after: pageInfo.endCursor,
                            },
                            updateQuery: (prev, {fetchMoreResult}) => {
                                if (!fetchMoreResult) return prev;
                                return {
                                    ...fetchMoreResult,
                                    energyAssetsByProject: {
                                        ...fetchMoreResult.energyAssetsByProject,
                                        edges: [
                                            ...(prev.energyAssetsByProject?.edges ?? []),
                                            ...fetchMoreResult.energyAssetsByProject.edges,
                                        ],
                                    },
                                };
                            },
                        })}
                    >Load more
                    </button>
                </div>
            )}
        </section>
    );
}
