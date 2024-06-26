import { inject } from "@azure/bonito-core/lib/environment";
import {
    DataGrid,
    DataGridColumn,
} from "@azure/bonito-ui/lib/components/data-grid";
import { BatchTaskOutput } from "@batch/ui-service/lib/batch-models";
import { BatchDependencyName } from "@batch/ui-service/lib/environment";
import { TaskService } from "@batch/ui-service/lib/task/task-service";
import { IconButton } from "@fluentui/react/lib/Button";
import React from "react";
import { CiCircleCheck, CiCircleChevDown } from "react-icons/ci";
import { MdOutlineRunningWithErrors } from "react-icons/md";
import { RiLoader3Fill, RiProgress1Line } from "react-icons/ri";

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
    const [isCompact] = React.useState<boolean>(false);

    React.useEffect(() => {
        let isMounted = true;
        const taskService: TaskService = inject(
            BatchDependencyName.TaskService
        );

        const fetchTaskList = async () => {
            const tasks = await taskService.listTasks(accountEndpoint, jobId);

            if (!isMounted) return;

            const pages = tasks.byPage();
            // .next not picking up BatchTaskOutput[] variable type
            const res: IteratorResult<BatchTaskOutput[], BatchTaskOutput[]> =
                await pages.next();
            setItems(tasksToRows(res.value));
        };

        fetchTaskList().catch((e) => {
            console.log("Error: ", e);
        });

        return () => {
            isMounted = false;
        };
    }, [accountEndpoint, jobId]);

    return (
        <DataGrid
            selectionMode="none"
            compact={isCompact}
            items={items}
            columns={columns}
        />
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
                        <CiCircleCheck
                            style={{
                                marginRight: 5,
                                color: "green",
                            }}
                        />
                    ) : task.state?.toLowerCase() === "active" ? (
                        <RiLoader3Fill
                            style={{
                                marginRight: 5,
                                color: "blue",
                            }}
                        />
                    ) : task.state?.toLowerCase() === "failed" ? (
                        <MdOutlineRunningWithErrors
                            style={{
                                marginRight: 5,
                                color: "red",
                            }}
                        />
                    ) : task.state?.toLowerCase() === "running" ? (
                        <RiProgress1Line
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
