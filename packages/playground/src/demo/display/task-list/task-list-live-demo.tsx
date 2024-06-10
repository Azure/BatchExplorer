import { inject } from "@azure/bonito-core/lib/environment";
import { TaskList } from "@batch/ui-react/lib/task/task-list";
import { BatchDependencyName } from "@batch/ui-service/lib/environment/batch-dependencies";
import { Stack } from "@fluentui/react/lib/Stack";
import React from "react";
import { DemoPane } from "../../../layout/demo-pane";
import { LiveTaskService } from "@batch/ui-service";

export const TaskListLiveDemo: React.FC = () => {
    const taskService: LiveTaskService = inject(
        BatchDependencyName.TaskService
    );
    const [accountEndpoint] = React.useState<string>(
        "dpwhobo.eastus2.batch.azure.com"
    );
    const [jobId] = React.useState<string>(
        "HelloWorldJob-dawatrou-20240703-132020"
    );

    React.useEffect(() => {
        return;
    }, [taskService]);

    return (
        <DemoPane title="Task List Live Demo Test">
            <Stack
                horizontal={true}
                tokens={{ childrenGap: "1em" }}
                verticalAlign="center"
                wrap={true}
                styles={{ root: { marginBottom: "1em" } }}
            ></Stack>
            <TaskList accountEndpoint={accountEndpoint} jobId={jobId} />
        </DemoPane>
    );
};
