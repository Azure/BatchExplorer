import { inject } from "@azure/bonito-core/lib/environment";
import { TaskList } from "@batch/ui-react/lib/task/task-list";
import { BatchDependencyName } from "@batch/ui-service/lib/environment/batch-dependencies";
import { FakeTaskService } from "@batch/ui-service/lib/task/fake-task-service";
import { Slider } from "@fluentui/react/lib/Slider";
import { Stack } from "@fluentui/react/lib/Stack";
import React from "react";
import { DemoPane } from "../../../layout/demo-pane";

export const TaskListDemo: React.FC = () => {
    const [taskNumberSlider, setTaskNumberSlider] = React.useState(0);
    const taskNumberSliderOnChange = (value: number) => {
        setTaskNumberSlider(value);
    };

    const taskService: FakeTaskService = inject(
        BatchDependencyName.TaskService
    );

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
                    <Slider
                        label="Additional Tasks Slider"
                        min={0}
                        max={50}
                        value={taskNumberSlider}
                        onChange={taskNumberSliderOnChange}
                    />
                </Stack.Item>
            </Stack>
            <TaskList
                accountEndpoint={"mercury.eastus.batch.azure.com"}
                jobId={"faketestjob1"}
            />
        </DemoPane>
    );
};
