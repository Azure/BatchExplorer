/**
 * JsonLanguage is a helper class that helps to define all autocomplete json schema for creating pools, jobs and tasks
 * All schema templates are defined in same directory and they are used in create resource json editor.
 */

// tslint:disable:no-var-requires
// const poolTemplate = JSON.parse(require("./pool.template.json"));
// const jobTemplate = JSON.parse(require("./job.template.json"));
// const taskTemplate = JSON.parse(require("./task.template.json"));
// const jobscheduleTemplate = JSON.parse(require("./jobschedule.template.json"));

const poolTemplate: any = {};
const jobTemplate: any = {};
const taskTemplate: any = {};
const jobscheduleTemplate: any = {};

export class JsonLanguage {
    public static define() {
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            schemas: [{
                uri: "//internal/pool.template.json",
                fileMatch: [ "*.pool.batch.json" ],
                schema: poolTemplate,
            },
            {
                uri: "//internal/job.template.json",
                fileMatch: [ "*.job.batch.json" ],
                schema: jobTemplate,
            },
            {
                uri: "//internal/task.template.json",
                fileMatch: [ "*.task.batch.json" ],
                schema: taskTemplate,
            },
            {
                uri: "//internal/jobscheduleTemplate.template.json",
                fileMatch: [ "*.jobschedule.batch.json" ],
                schema: jobscheduleTemplate,
            }],
        });
    }
}
