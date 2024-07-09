import * as React from "react";
import { inject } from "@azure/bonito-core/lib/environment";
import {
    DataGrid,
    DataGridColumn,
} from "@azure/bonito-ui/lib/components/data-grid";
import { BatchTaskOutput } from "@batch/ui-service/lib/batch-models";
import { BatchDependencyName } from "@batch/ui-service/lib/environment";
import { TaskService } from "@batch/ui-service/lib/task/task-service";
import { Icon } from "@fluentui/react/lib/Icon";
import { IconButton } from "@fluentui/react/lib/Button";
import { CiCircleChevDown } from "react-icons/ci";
import { useLoadMore } from "@azure/bonito-ui/lib/hooks";

interface TaskListProps {
    accountEndpoint: string;
    jobId: string;
}

interface TaskRow {
    url?: string;
    id?: string;
    state?: string;
    creationTime?: string;
    exitCode?: number;
}

export const TaskList = (props: TaskListProps) => {
    const { accountEndpoint, jobId } = props;
    const [isCompact] = React.useState<boolean>(true);
    const [pageSize] = React.useState<number>(100);
    const [_, setLoadErrorMsg] = React.useState<string>("");

    // store result of iterator pages in state variable, want to be global and use in loadMore func

    const onLoad = React.useMemo(() => {
        let iterator: AsyncIterableIterator<BatchTaskOutput[]>;

        return (fresh: boolean) => {
            const taskService: TaskService = inject(
                BatchDependencyName.TaskService
            );

            const fetchTaskList = async () => {
                if (fresh || !iterator) {
                    const tasks = await taskService.listTasks(
                        accountEndpoint,
                        jobId
                    );
                    iterator = tasks.byPage({ maxPageSize: pageSize });
                }
                try {
                    const res: IteratorResult<
                        BatchTaskOutput[],
                        BatchTaskOutput[]
                    > = await iterator.next();

                    if (!res.done) {
                        return {
                            items: tasksToRows(res.value),
                            done: false,
                        };
                    } else {
                        return {
                            items: tasksToRows(res.value),
                            done: true,
                        };
                    }
                } catch (e: any) {
                    console.log(e);
                    return { items: [], done: true };
                }
            };
            return fetchTaskList();
        };
    }, [accountEndpoint, jobId, pageSize]);

    const onLoadError = (error: unknown) => {
        setLoadErrorMsg((error as { message: string })?.message ?? "");
    };
    const { items, hasMore, onLoadMore } = useLoadMore<TaskRow>(
        onLoad,
        onLoadError
    );

    return (
        <>
            <DataGrid
                selectionMode="none"
                compact={isCompact}
                items={items}
                columns={columns}
                hasMore={hasMore}
                onLoadMore={onLoadMore}
            />
        </>
    );
};

function tasksToRows(tasks: BatchTaskOutput[]): TaskRow[] {
    const rows = [];

    for (const task of tasks) {
        rows.push({
            url: task.url,
            id: task.id,
            state: task.state,
            creationTime: task.creationTime,
            exitCode: task.exitConditions?.exitCodes?.[0].code,
        });
    }
    return rows;
}

const columns: DataGridColumn<TaskRow>[] = [
    {
        label: "Task",
        prop: "id",
        minWidth: 100,
        maxWidth: 150,
        onRender: (task) => {
            return <a href={task.url}>{task.id}</a>;
        },
    },
    {
        label: "State",
        prop: "state",
        minWidth: 150,
        maxWidth: 200,
        onRender: (task) => {
            return (
                <div>
                    {task.state?.toLowerCase() === "completed" ? (
                        <Icon
                            iconName="SkypeCircleCheck"
                            style={{
                                marginRight: 5,
                                color: "green",
                            }}
                        />
                    ) : task.state?.toLowerCase() === "active" ? (
                        <Icon
                            iconName="SyncStatusSolid"
                            style={{
                                marginRight: 5,
                                color: "blue",
                            }}
                        />
                    ) : task.state?.toLowerCase() === "failed" ? (
                        <Icon
                            iconName="StatusErrorFull"
                            style={{
                                marginRight: 5,
                                color: "red",
                            }}
                        />
                    ) : task.state?.toLowerCase() === "running" ? (
                        <Icon
                            iconName="SkypeCircleClock"
                            style={{
                                marginRight: 5,
                                color: "orange",
                            }}
                        />
                    ) : null}
                    {task.state}
                </div>
            );
        },
    },
    {
        label: "Created",
        prop: "created",
        minWidth: 150,
        maxWidth: 200,
        onRender: (task) => {
            return <div>{task.creationTime}</div>;
        },
    },
    {
        label: "Exit code",
        prop: "exitCode",
        minWidth: 150,
        onRender: (task) => {
            return <div>{task.exitCode}</div>;
        },
    },
    {
        label: " ",
        prop: " ",
        minWidth: 150,
        onRender: (task) => {
            return (
                <div>
                    <IconButton>
                        <CiCircleChevDown />
                    </IconButton>
                </div>
            );
        },
    },
];
