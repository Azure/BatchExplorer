import { inject } from "@azure/bonito-core/lib/environment";
import { TaskList } from "@batch/ui-react/lib/task/task-list";
import { BatchDependencyName } from "@batch/ui-service/lib/environment/batch-dependencies";
import { FakeTaskService } from "@batch/ui-service/lib/task/fake-task-service";
import { Stack } from "@fluentui/react/lib/Stack";
import React from "react";
import { DemoPane } from "../../../layout/demo-pane";
import { Unstable_NumberInput as NumberInput } from "@mui/base/Unstable_NumberInput";

export const TaskListDemo: React.FC = () => {
    const taskService: FakeTaskService = inject(
        BatchDependencyName.TaskService
    );

    const [taskNumberField, setTaskNumberField] = React.useState<
        number | undefined
    >(undefined);
    const [accountEndpoint] = React.useState<string>(
        "mercury.eastus.batch.azure.com"
    );
    const [jobId] = React.useState<string>("faketestjob1");

    taskService.generateTasks = true;
    taskService.numOfTasks = taskNumberField;

    return (
        <DemoPane title="Task List Demo Test">
            <Stack
                horizontal={true}
                tokens={{ childrenGap: "1em" }}
                verticalAlign="center"
                wrap={true}
                styles={{ root: { marginBottom: "1em" } }}
            >
                <Stack.Item grow={1}>
                    <NumberInput
                        value={taskNumberField}
                        onChange={(_, newValue) => {
                            setTaskNumberField(newValue!);
                        }}
                    />
                </Stack.Item>
            </Stack>
            <TaskList accountEndpoint={accountEndpoint} jobId={jobId} />
        </DemoPane>
    );
};
