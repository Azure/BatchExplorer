import { inject } from "@azure/bonito-core/lib/environment";
import { TaskList } from "@batch/ui-react/lib/task/task-list";
import { BatchDependencyName } from "@batch/ui-service/lib/environment/batch-dependencies";
import { FakeTaskService } from "@batch/ui-service/lib/task/fake-task-service";
import { Slider } from "@fluentui/react/lib/Slider";
import { Stack } from "@fluentui/react/lib/Stack";
import React from "react";
import { DemoPane } from "../../../layout/demo-pane";
import { TextField } from "@azure/bonito-ui/src/components/form";
import { TextFieldOnChange } from "../../../functions";
//import { PagedAsyncIterableIterator } from "@azure/core-paging";

export const TaskListDemo: React.FC = () => {
    const [taskNumberField, setTaskNumberField] = React.useState(0);
    const [items, setItems] = React.useState<any>([]);

    const [accountEndpoint] = React.useState<string>(
        "mercury.eastus.batch.azure.com"
    );
    const [jobId] = React.useState<string>("faketestjob1");

    React.useEffect(() => {
        let isMounted = true;

        const taskService: FakeTaskService = inject(
            BatchDependencyName.TaskService
        );

        const fetchTaskList = async () => {
            if (!isMounted) return;

            const tasks = await taskService.listTasks(accountEndpoint, jobId);

            setItems(tasks);
        };

        fetchTaskList().catch((e) => {
            console.log("Error: ", e);
        });

        return () => {
            isMounted = false;
        };
    }, [accountEndpoint, jobId]);

    return (
        <DemoPane title="Task List Demo">
            <Stack
                horizontal={true}
                tokens={{ childrenGap: "1em" }}
                verticalAlign="center"
                wrap={true}
                styles={{ root: { marginBottom: "1em" } }}
            >
                <Stack.Item grow={1}>
                    <TextField
                        value={taskNumberField}
                        onChange={(_, newValue) => {
                            const number = parseInt(`${newValue}`);
                            setTaskNumberField(number);
                        }}
                    />
                </Stack.Item>
            </Stack>
            <TaskList pagedTasks={items} />
        </DemoPane>
    );
};
