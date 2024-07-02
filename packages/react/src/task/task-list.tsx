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
import { GridFooter } from "../components/grid-utils/grid-footer/data-grid-footer";

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
    const [items, setItems] = React.useState<TaskRow[]>([]);
    const [isCompact] = React.useState<boolean>(true);
    const [pageSize] = React.useState<number>(20);
    const [currentPage, setCurrentPage] = React.useState<number>(1);
    const [totalItems, setTotalItems] = React.useState<number>(0);

    // store result of iterator pages in state variable, want to be global and use in loadMore func
    const [iterator, setIterator] =
        React.useState<AsyncIterableIterator<BatchTaskOutput[]>>();

    React.useEffect(() => {
        let isMounted = true;
        const taskService: TaskService = inject(
            BatchDependencyName.TaskService
        );

        const fetchTaskList = async () => {
            const tasks = await taskService.listTasks(accountEndpoint, jobId);

            if (!isMounted) return;

            const pages = tasks.byPage({ maxPageSize: pageSize });

            const res: IteratorResult<BatchTaskOutput[], BatchTaskOutput[]> =
                await pages.next();
            setIterator(pages);
            setItems(tasksToRows(res.value));
        };

        fetchTaskList().catch((e) => {
            console.log("Error: ", e);
        });

        return () => {
            isMounted = false;
        };
    }, [accountEndpoint, jobId, pageSize]);

    return (
        <>
            <DataGrid
                selectionMode="none"
                compact={isCompact}
                items={items}
                columns={columns}
            />
            <GridFooter
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={totalItems}
                nextPage={() => {
                    iterator?.next().then((res) => {
                        setItems(res.value);
                    });
                    setCurrentPage(currentPage + 1);
                }}
                previousPage={() => {
                    return;
                }}
                firstPage={() => {
                    //get page?
                    return;
                }}
                lastPage={() => {
                    //get page?
                    return;
                }}
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
