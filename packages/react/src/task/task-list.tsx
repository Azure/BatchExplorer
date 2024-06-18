import React from "react";
import { CiCircleCheck, CiClock1 } from "react-icons/ci";
import {
    DataGrid,
    DataGridColumn,
} from "@azure/bonito-ui/lib/components/data-grid";
import { BatchTaskOutput } from "@batch/ui-service/lib/batch-models";
import { inject } from "@azure/bonito-core/lib/environment";
import { BatchDependencyName } from "@batch/ui-service/lib/environment";
import { TaskService } from "@batch/ui-service/lib/task/task-service";

interface TaskListProps {
    accountEndpoint: string;
    jobId: string;
    numOfTasks: number;
}

interface taskRow extends BatchTaskOutput {
    url?: string | undefined;
    id?: string | undefined;
    state?: string | undefined;
}

export const TaskList = (props: TaskListProps) => {
    const { accountEndpoint, jobId, numOfTasks } = props;
    const [isCompact] = React.useState<boolean>(false);
    const [items, setItems] = React.useState<taskRow[]>([]);

    React.useEffect(() => {
        let isMounted = true;

        const taskService: TaskService = inject(
            BatchDependencyName.TaskService
        );

        const fetchTaskList = async () => {
            if (!isMounted) return;

            const tasks = await taskService.listTasks(accountEndpoint, jobId);

            const auxList = [];
            for await (const task of tasks) {
                auxList.push({
                    url: task.url,
                    id: task.id,
                    state: " " + task.state,
                    executionInfo: task.executionInfo,
                });
            }

            setItems(auxList);
        };

        fetchTaskList().catch((e) => {
            console.log("Error: ", e);
        });

        return () => {
            isMounted = false;
        };
    }, [accountEndpoint, jobId, numOfTasks]);

    return <DataGrid compact={isCompact} items={items} columns={columns} />;
};

const columns: DataGridColumn[] = [
    {
        label: "Url",
        prop: "url",
        minWidth: 100,
        maxWidth: 150,
    },
    {
        label: "Name",
        prop: "id",
        minWidth: 100,
        maxWidth: 150,
        onRender: (task: any) => {
            return <a href={task.url}>{task.id}</a>;
        },
    },
    {
        label: "State",
        prop: "state",
        minWidth: 150,
        maxWidth: 200,
        onRender: (task: any) => {
            return (
                <div>
                    {task.state == "completed" ? (
                        <CiCircleCheck />
                    ) : (
                        <CiClock1 />
                    )}
                    {task.state}
                </div>
            );
        },
    },
    {
        label: "ExecutionInfo",
        prop: "executioninfo",
        minWidth: 150,
        onRender: (task: any) => {
            return (
                <div>
                    Retry count: {task.executionInfo.retryCount} {"\n"}
                    Requeue count: {task.executionInfo.requeueCount}
                </div>
            );
        },
    },
];
