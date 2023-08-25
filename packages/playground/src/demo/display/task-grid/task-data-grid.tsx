import React from "react";
import { DemoPane } from "../../../layout/demo-pane";
import {
    DataGridLoadMore,
    ILoadMoreListResult,
    useLoadMore,
} from "@azure/bonito-ui/lib/components/data-grid-load-more";
import { IColumn } from "@fluentui/react/lib/components/DetailsList";
import { IDemoTask, loadDemoTasks } from "./utils";
import { TextField } from "@fluentui/react/lib/TextField";

export const DataGridLoadMoreDemo = () => {
    const [filter, setFilter] = React.useState<string>("");
    const nextToken = React.useRef<string>();

    const loadFn = React.useCallback(async (): Promise<
        ILoadMoreListResult<IDemoTask>
    > => {
        const result = await loadDemoTasks({
            filter,
            nextToken: nextToken.current,
        });
        nextToken.current = result.nextToken;
        return {
            done: !result.nextToken,
            list: result.list,
        };
    }, [filter]);

    const { items, hasMore, loadMoreCallback } = useLoadMore(loadFn);

    return (
        <DemoPane title="Data grid load more">
            <TextField
                label="Filter"
                value={filter}
                onChange={(_, newValue) => {
                    setFilter(newValue || "");
                }}
            />
            <DataGridLoadMore
                items={items}
                colums={columns}
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
