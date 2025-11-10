import React from "react";
import type {ProjectStatus, EnergyAssetType} from "./types";
import {CustomersPanel} from "./components/CustomersPanel";
import {ProjectsPanel} from "./components/ProjectsPanel";
import {AssetsPanel} from "./components/AssetsPanel";

export function App() {
    const [selectedCustomer, setSelectedCustomer] = React.useState<string | null>(null);
    const [selectedProject, setSelectedProject] = React.useState<string | null>(null);
    const [projectStatus, setProjectStatus] = React.useState<ProjectStatus | "">("");
    const [assetType, setAssetType] = React.useState<EnergyAssetType | "">("");

    React.useEffect(() => {
        // Reset dependent selections when parent changes
        setSelectedProject(null);
    }, [selectedCustomer]);

    return (
        <div className="container">
            <CustomersPanel
                selectedCustomer={selectedCustomer}
                onSelectCustomer={setSelectedCustomer}
            />
            <ProjectsPanel
                customerId={selectedCustomer}
                selectedProject={selectedProject}
                onSelectProject={setSelectedProject}
                status={projectStatus || undefined}
                onChangeStatus={setProjectStatus}
            />
            <AssetsPanel
                projectId={selectedProject}
                type={assetType || undefined}
                onChangeType={setAssetType}
            />
        </div>
    );
}
 
