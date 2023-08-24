import React from "react";
import { DemoPane } from "../../../layout/demo-pane";
import { DataGrid } from "@azure/bonito-ui/lib/components/data-grid-load-more";
import { IColumn } from "@fluentui/react/lib/components/DetailsList";
import { IDemoTask, loadDemoTasks } from "./utils";
import { useEffect } from "react";

export const DataGridLoadMoreDemo = () => {
    const [items, setItems] = React.useState<IDemoTask[]>([]);
    const [hasMore, setHasMore] = React.useState(true);
    // const [isLoading, setIsLoading] = React.useState(false);

    const loadMoreCallback = React.useCallback(() => {
        return loadDemoTasks().then((result) => {
            const { data, done } = result;
            if (!done && !data.length) {
                loadMoreCallback();
                return;
            }
            if (done) {
                setHasMore(false);
                return;
            }
            setItems((oriItems) => [...oriItems, ...data]);
        });
    }, []);

    useEffect(() => {
        // initial load
        // setIsLoading(true);
        loadMoreCallback().finally(() => {
            // setIsLoading(false);
        });
    }, [loadMoreCallback]);

    return (
        <DemoPane title="Data grid load more">
            <DataGrid
                items={items}
                colums={columns}
                // isLoading={isLoading}
                hasMore={hasMore}
                onLoadMore={async () => {
                    console.log("onLoadMore called");
                    return loadMoreCallback();
                }}
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
