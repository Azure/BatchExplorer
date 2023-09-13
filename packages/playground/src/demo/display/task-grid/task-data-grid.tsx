import React, { useEffect } from "react";
import { DemoPane } from "../../../layout/demo-pane";
import {
    DataGrid,
    DataGridColumn,
} from "@azure/bonito-ui/lib/components/data-grid";
import { DemoTasksLoader } from "./utils";
import { TextField } from "@fluentui/react/lib/TextField";
import { PrimaryButton } from "@fluentui/react/lib/Button";
import { Stack } from "@fluentui/react/lib/Stack";
import { Checkbox } from "@fluentui/react/lib/Checkbox";
import { useLoadMore } from "@azure/bonito-ui/lib/hooks";
import { MessageBar, MessageBarType } from "@fluentui/react/lib/MessageBar";

export const DataGridLoadMoreDemo = () => {
    const [filter, setFilter] = React.useState<string>("");
    const [limit, setLimit] = React.useState<number>(10);
    const [noData, setNoData] = React.useState<boolean>(false);
    const [isCompact, setIsCompact] = React.useState<boolean>(false);
    const [hasError, setHasError] = React.useState<boolean>(false);
    const [loadErrorMsg, setLoadErrorMsg] = React.useState<string>("");

    const onLoad = React.useMemo(() => {
        const taskLoader = new DemoTasksLoader(filter, limit, noData, hasError);
        return taskLoader.loadTasksFn;
    }, [filter, limit, noData, hasError]);

    const onLoadError = (error: any) => {
        setLoadErrorMsg(error?.message ?? "");
    };

    useEffect(() => {
        setLoadErrorMsg("");
    }, [onLoad]);

    const { items, hasMore, onLoadMore, onRefresh } = useLoadMore(
        onLoad,
        onLoadError
    );

    return (
        <DemoPane title="Data Grid: Load More">
            <Stack
                horizontal={true}
                tokens={{ childrenGap: "1em" }}
                verticalAlign="center"
                wrap={true}
                styles={{ root: { marginBottom: "1em" } }}
            >
                <Stack.Item grow={1}>
                    <TextField
                        prefix="Filter"
                        value={filter}
                        onChange={(_, newValue) => {
                            setFilter(newValue || "");
                        }}
                    />
                </Stack.Item>
                <Stack.Item grow={1}>
                    <TextField
                        prefix="Limit"
                        type="number"
                        value={limit.toString()}
                        onChange={(_, newValue) => {
                            const limit = Number(newValue);
                            setLimit(Number.isNaN(limit) ? 10 : limit);
                        }}
                    />
                </Stack.Item>
                <Stack.Item grow={0}>
                    <Checkbox
                        label="No data"
                        checked={noData}
                        onChange={() => {
                            setNoData(!noData);
                        }}
                    />
                </Stack.Item>
                <Stack.Item grow={0}>
                    <Checkbox
                        label="Compact Mode"
                        checked={isCompact}
                        onChange={() => {
                            setIsCompact(!isCompact);
                        }}
                    />
                </Stack.Item>
                <Stack.Item grow={0}>
                    <Checkbox
                        label="Load Error"
                        checked={hasError}
                        onChange={() => {
                            setHasError(!hasError);
                        }}
                    />
                </Stack.Item>
                <Stack.Item grow={0}>
                    <PrimaryButton
                        iconProps={{ iconName: "Refresh" }}
                        onClick={() => {
                            onRefresh();
                            setLoadErrorMsg("");
                        }}
                    >
                        Refresh
                    </PrimaryButton>
                </Stack.Item>
            </Stack>
            {loadErrorMsg && (
                <MessageBar
                    messageBarType={MessageBarType.error}
                    isMultiline={false}
                    dismissButtonAriaLabel="Close"
                >
                    {`Error: ${loadErrorMsg}, please refresh.`}
                </MessageBar>
            )}
            <DataGrid
                compact={isCompact}
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
