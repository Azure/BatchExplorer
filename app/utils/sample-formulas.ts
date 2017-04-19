import { AutoscaleFormula } from "app/models";

export const predefinedFormulas = <AutoscaleFormula[]>[
    {
        name: "Time-based adjustment",
        value:  "$curTime = time();\n" +
                "$workHours = $curTime.hour >= 8 && $curTime.hour < 18;\n" +
                "$isWeekday = $curTime.weekday >= 1 && $curTime.weekday <= 5;\n" +
                "$isWorkingWeekdayHour = $workHours && $isWeekday;\n" +
                "$TargetDedicated = $isWorkingWeekdayHour ? 20:10;",
    },
    {
        name: "Task-based adjustment",
        value: "// Get pending tasks for the past 15 minutes.\n"
        + "$samples = $ActiveTasks.GetSamplePercent(TimeInterval_Minute * 15);\n"
        + "// If we have fewer than 70 percent data points, we use the last sample point, "
        + "otherwise we use the maximum of last sample point and the history average.\n"
        // tslint:disable-next-line:max-line-length
        + "$tasks = $samples < 70 ? max(0,$ActiveTasks.GetSample(1)) : max( $ActiveTasks.GetSample(1), avg($ActiveTasks.GetSample(TimeInterval_Minute * 15)));\n"
        + "// If number of pending tasks is not 0, set targetVM to pending tasks, otherwise half of current dedicated.\n"
        + "$targetVMs = $tasks > 0? $tasks:max(0, $TargetDedicated/2);\n"
        + "// The pool size is capped at 20, if target VM value is more than that, set it to 20."
        + "This value should be adjusted according to your use case.\n"
        + "$TargetDedicated = max(0, min($targetVMs, 20));\n"
        + "// Set node deallocation mode - keep nodes active only until tasks finish\n"
        + "$NodeDeallocationOption = taskcompletion;",
    },
    {
        name: "Accounting for parallel tasks",
        value: "// Determine whether 70 percent of the samples have been recorded in the past\n" +
        "// 15 minutes; if not, use last sample\n" +
        "$samples = $ActiveTasks.GetSamplePercent(TimeInterval_Minute * 15);\n" +
        // tslint:disable-next-line:max-line-length
        "$tasks = $samples < 70 ? max(0,$ActiveTasks.GetSample(1)) : max( $ActiveTasks.GetSample(1),avg($ActiveTasks.GetSample(TimeInterval_Minute * 15)));\n" +
        "// Set the number of nodes to add to one-fourth the number of active tasks (the " +
        "MaxTasksPerComputeNode property on this pool is set to 4, adjust this number " +
        "for your use case)\n" +
        "$cores = $TargetDedicated * 4;\n" +
        "$extraVMs = (($tasks - $cores) + 3) / 4;\n" +
        "$targetVMs = ($TargetDedicated + $extraVMs);\n" +
        "// Attempt to grow the number of compute nodes to match the number of active " +
        "tasks, with a maximum of 3\n" +
        "$TargetDedicated = max(0,min($targetVMs,3));\n" +
        "// Keep the nodes active until the tasks finish\n" +
        "$NodeDeallocationOption = taskcompletion;",
    },
    {
        name: "Setting an initial pool size",
        value:  "$TargetDedicated = 4;\n" +
                "lifespan = time() - time(\"Mon, 06 Oct 2014 10:20:00 GMT\");\n" +
                "span = TimeInterval_Minute * 60;\n" +
                "startup = TimeInterval_Minute * 10;\n" +
                "ratio = 50;\n" +
                // tslint:disable-next-line:max-line-length
                "$TargetDedicated = (lifespan > startup ? (max($RunningTasks.GetSample(span, ratio), $ActiveTasks.GetSample(span, ratio)) == 0 ? 0 : $TargetDedicated) : 4);",
    },
];
