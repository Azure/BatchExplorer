import React, { useEffect } from "react";
import { DemoPane } from "../../../layout/demo-pane";
import {
    DataGrid,
    DataGridColumn,
    ILoadMoreListResult,
    useLoadMoreItems,
} from "@azure/bonito-ui/lib/components/data-grid";
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

    useEffect(() => {
        // reset the next token when the filter changes
        nextToken.current = undefined;
    }, [filter]);

    const { items, hasMore, loadMoreCallback } = useLoadMoreItems(loadFn);

    return (
        <DemoPane title="Data grid load more">
            <TextField
                label="Filter"
                value={filter}
                onChange={(_, newValue) => {
                    setFilter(newValue || "");
                }}
            />
            <DataGrid
                items={items}
                columns={columns}
                hasMore={hasMore}
                onLoadMore={loadMoreCallback}
            />
        </DemoPane>
    );
};

const columns: DataGridColumn[] = [
    {
        label: "Name",
        prop: "name",
        minWidth: 100,
        maxWidth: 150,
    },
    {
        label: "State",
        prop: "state",
        minWidth: 100,
        maxWidth: 150,
    },
    {
        label: "Created",
        prop: "created",
        minWidth: 150,
        maxWidth: 200,
    },
    {
        label: "Exit code",
        prop: "exitCode",
        minWidth: 150,
    },
];
