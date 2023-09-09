import React from "react";
import { DemoPane } from "../../../layout/demo-pane";
import {
    DataGrid,
    DataGridColumn,
    useLoadMoreItems,
} from "@azure/bonito-ui/lib/components/data-grid";
import { TasksLoader } from "./utils";
import { TextField } from "@fluentui/react/lib/TextField";
import { IconButton } from "@fluentui/react/lib/Button";

export const DataGridLoadMoreDemo = () => {
    const [filter, setFilter] = React.useState<string>("");
    const [limit, setLimit] = React.useState<number>(13);

    const loadFn = React.useMemo(() => {
        const taskLoader = new TasksLoader(filter, limit);
        return taskLoader.loadTasksFn;
    }, [filter, limit]);

    const { items, hasMore, onLoadMore, refresh } = useLoadMoreItems(loadFn);

    return (
        <DemoPane title="Data grid load more">
            <TextField
                label="Filter"
                value={filter}
                onChange={(_, newValue) => {
                    setFilter(newValue || "");
                }}
            />
            <TextField
                label="Limit"
                type="number"
                value={limit.toString()}
                onChange={(_, newValue) => {
                    const limit = Number(newValue);
                    setLimit(Number.isNaN(limit) ? 10 : limit);
                }}
            />
            <IconButton iconProps={{ iconName: "Refresh" }} onClick={refresh}>
                Refresh
            </IconButton>
            <DataGrid
                items={items}
                columns={columns}
                hasMore={hasMore}
                onLoadMore={onLoadMore}
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
