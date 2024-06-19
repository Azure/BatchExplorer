import React from "react";
import { CiCircleCheck, CiAvocado } from "react-icons/ci";
import {
    DataGrid,
    DataGridColumn,
} from "@azure/bonito-ui/lib/components/data-grid";
import { BatchTaskOutput } from "@batch/ui-service/lib/batch-models";
import { CiCircleChevDown } from "react-icons/ci";
import { IconButton } from "@fluentui/react/lib/Button";
import { PagedAsyncIterableIterator } from "@azure/core-paging";

interface TaskListProps {
    pagedTasks: PagedAsyncIterableIterator<BatchTaskOutput>;
}

interface taskRow extends BatchTaskOutput {
    url?: string | undefined;
    id?: string | undefined;
    state?: string | undefined;
}

export const TaskList = (props: TaskListProps) => {
    const { pagedTasks } = props;
    const [items, setItems] = React.useState<taskRow[]>([]);
    const [isCompact] = React.useState<boolean>(false);

    React.useEffect(() => {
        const taskArray = [];

        for await (const task of pagedTasks) {
            taskArray.push({
                url: task.url,
                id: task.id,
                state: task.state,
                creationTime: task.creationTime,
                executionInfo: task.executionInfo,
            });
        }

        setItems(taskArray);
    }, [pagedTasks]);

    return (
        <DataGrid
            selectionMode="none"
            compact={isCompact}
            items={items}
            columns={columns}
        />
    );
};

const columns: DataGridColumn[] = [
    {
        label: "Task",
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
                    {task.state === "completed" ? (
                        <CiCircleCheck
                            style={{
                                marginRight: 6,
                                color: "green",
                            }}
                        />
                    ) : (
                        <CiAvocado
                            style={{
                                marginRight: 6,
                                color: "green",
                            }}
                        />
                    )}
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
        onRender: (task: any) => {
            return <div>{task.creationTime}</div>;
        },
    },
    {
        label: "Exit Code",
        prop: "exitcode",
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
    {
        label: " ",
        prop: " ",
        minWidth: 150,
        onRender: (task: any) => {
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
/**
 <IconButton
 name=""
 iconProps={}
 />
 */
