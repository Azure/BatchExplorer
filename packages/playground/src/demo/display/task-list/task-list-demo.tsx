import React from "react";
import { TaskList } from "@batch/ui-react/lib/task/task-list";
import { DemoPane } from "../../../layout/demo-pane";

// TODO: look at vm-extension-list.tsx & vm-extension-list-demo.tsx
// Donutchart created here too
export const TaskListDemo: React.FC = () => {
    // const [accountEndpoint] = React.useState<string>("accountTest");
    //  const [jobId] = React.useState<string>("jobIdTest");
    const [numOfTasks] = React.useState<number>(5);

    return (
        <DemoPane title="Task List">
            <TaskList
                accountEndpoint={"accountTest"}
                jobId={"jobTest"}
                numOfTasks={numOfTasks}
            />
        </DemoPane>
    );
};

//DonutChart should be here under DemoPane
/*
  <DemoPane title="Task List">
        <DonutChart />
        <TaskList
            accountEndpoint=varaible
            jobId=variable
            numOfTasks=variable
        />
    </DemoPane>
*/
