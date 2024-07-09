import { inject } from "@azure/bonito-core/lib/environment";
import { TaskList } from "@batch/ui-react/lib/task/task-list";
import { BatchDependencyName } from "@batch/ui-service/lib/environment/batch-dependencies";
import { FakeTaskService } from "@batch/ui-service/lib/task/fake-task-service";
import { Stack } from "@fluentui/react/lib/Stack";
import React from "react";
import { DemoPane } from "../../../layout/demo-pane";
import { SpinButton } from "@fluentui/react/lib/SpinButton";

export const TaskListDemo: React.FC = () => {
    const taskService: FakeTaskService = inject(
        BatchDependencyName.TaskService
    );

    const [spinButtonValue, setSpinButton] = React.useState<number | undefined>(
        undefined
    );
    const [accountEndpoint] = React.useState<string>(
        "mercury.eastus.batch.azure.com"
    );
    const [jobId, setJobId] = React.useState<string>("faketestjob1");

    taskService.generateTasks = true;
    taskService.numOfTasks = spinButtonValue;

    React.useEffect(() => {
        taskService.numOfTasks = spinButtonValue;
        setSpinButton(spinButtonValue);
        setJobId("testjob" + spinButtonValue?.toString());
    }, [spinButtonValue, taskService, jobId]);

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
                    <SpinButton
                        label="Number of Tasks"
                        min={0}
                        value={
                            spinButtonValue != undefined
                                ? spinButtonValue.toString()
                                : ""
                        }
                        onIncrement={(value) => {
                            const numberValue = Number(value);
                            if (!isNaN(numberValue)) {
                                setSpinButton(numberValue + 1);
                            }
                        }}
                        onDecrement={(value) => {
                            const numberValue = Number(value);
                            if (!isNaN(numberValue)) {
                                setSpinButton(numberValue - 1);
                            }
                        }}
                        onChange={(_, newValue) => {
                            setSpinButton(Number(newValue) ?? undefined);
                        }}
                    />
                </Stack.Item>
            </Stack>
            <TaskList accountEndpoint={accountEndpoint} jobId={jobId} />
        </DemoPane>
    );
};
