import React from "react";
import { CiCircleCheck } from "react-icons/ci";
import {
    DataGrid,
    DataGridColumn,
} from "@azure/bonito-ui/lib/components/data-grid";
import { BatchTaskOutput } from "@batch/ui-service/lib/batch-models";
import { CiCircleChevDown } from "react-icons/ci";
import { IconButton } from "@fluentui/react/lib/Button";
import { MdOutlineRunningWithErrors } from "react-icons/md";
import { RiProgress1Line, RiLoader3Fill } from "react-icons/ri";

interface TaskListProps {
    pagedTasks: any;
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
        const parseTasks = async () => {
            const taskArray = [];

            for await (const task of pagedTasks) {
                taskArray.push({
                    url: task.url,
                    id: task.id,
                    state: task.state,
                    creationTime: task.creationTime,
                    executionInfo: task.executionInfo,
                    exitConditions: task.exitConditions?.exitCodes[0].code,
                });
            }
            setItems(taskArray);
        };
        parseTasks();
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
                    {task.state.toLowerCase() === "completed" ? (
                        <CiCircleCheck
                            style={{
                                marginRight: 5,
                                color: "green",
                            }}
                        />
                    ) : task.state.toLowerCase() === "active" ? (
                        <RiLoader3Fill
                            style={{
                                marginRight: 5,
                                color: "blue",
                            }}
                        />
                    ) : task.state.toLowerCase() === "failed" ? (
                        <MdOutlineRunningWithErrors
                            style={{
                                marginRight: 5,
                                color: "red",
                            }}
                        />
                    ) : task.state.toLowerCase() === "running" ? (
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
        onRender: (task: any) => {
            return <div>{task.creationTime}</div>;
        },
    },
    {
        label: "Exit code",
        prop: "exitCode",
        minWidth: 150,
        onRender: (task: any) => {
            return <div>{task.exitConditions}</div>;
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
