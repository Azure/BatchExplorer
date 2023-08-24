import React from "react";
import { DemoPane } from "../../../layout/demo-pane";
import { DataGrid } from "@azure/bonito-ui/lib/components/data-grid-load-more";
import { IColumn } from "@fluentui/react/lib/components/DetailsList";
import { useLoadMore } from "./hooks";
import { loadDemoTasks } from "./utils";

export const DataGridLoadMoreDemo = () => {
    const loadFn = React.useCallback(() => {
        return loadDemoTasks();
    }, []);

    const { items, hasMore, loadMoreCallback } = useLoadMore(loadFn);

    return (
        <DemoPane title="Data grid load more">
            <DataGrid
                items={items}
                colums={columns}
                // isLoading={isLoading}
                hasMore={hasMore}
                onLoadMore={loadMoreCallback}
            />
        </DemoPane>
    );
};

const columns: IColumn[] = [
    {
        key: "name",
        name: "Name",
        fieldName: "name",
        minWidth: 100,
        maxWidth: 150,
        isResizable: true,
    },
    {
        key: "state",
        name: "State",
        fieldName: "state",
        minWidth: 100,
    },
    {
        key: "created",
        name: "Created",
        fieldName: "created",
        minWidth: 150,
    },
    {
        key: "exitCode",
        name: "Exit code",
        fieldName: "exitCode",
        minWidth: 100,
    },
];
