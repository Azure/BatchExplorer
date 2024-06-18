import React from "react";
import { TaskList } from "@batch/ui-react/lib/task/task-list";
import { DemoPane } from "../../../layout/demo-pane";
import { Stack } from "@fluentui/react/lib/Stack";
import { Slider } from "@fluentui/react/lib/Slider";

export const TaskListDemo: React.FC = () => {
    const [taskNumberSlider, setTaskNumberSlider] = React.useState(0);
    const taskNumberSliderOnChange = (value: number) => {
        setTaskNumberSlider(value);
    };

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
                numOfTasks={taskNumberSlider}
            />
        </DemoPane>
    );
};
