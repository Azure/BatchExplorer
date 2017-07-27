import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { autobind } from "core-decorators";
import { Subscription } from "rxjs";

import { NcjTemplateService, PythonRpcService } from "app/services";
import "./submit-market-application.scss";

@Component({
    selector: "bl-submit-market-application",
    templateUrl: "submit-market-application.html",
})
export class SubmitMarketApplicationComponent implements OnInit {
    public static breadcrumb() {
        return { name: "Submit" };
    }

    public applicationId: string;
    public actionId: string;
    public title = "";
    public jobTemplate;
    public poolTemplate;
    public form: FormGroup;

    private _paramsSubscriber: Subscription;

    // Constructor create data structure from reading json files
    constructor(
        public formBuilder: FormBuilder,
        private pythonRpcService: PythonRpcService,
        private route: ActivatedRoute,
        private templateService: NcjTemplateService) {
        this.form = new FormGroup({ a: new FormControl() });
        console.log("Entered Market");
    }

    public ngOnInit() {
        this._paramsSubscriber = this.route.params.subscribe((params) => {
            this.applicationId = params["applicationId"];
            this.actionId = params["actionId"];
            this._updateTitle();
            this._getTemplates();
        });

    }

    public createForms() {
        let parameterKeys = Object.keys(this.jobTemplate["parameters"]);
        console.log("Create forms");
        let fg = {};
        for (let key of parameterKeys) {
            if ("defaultValue" in this.jobTemplate["parameters"][key]) {
                fg[key] = new FormControl(String(this.jobTemplate["parameters"][key]["defaultValue"]));
            } else {
                fg[key] = new FormControl();
            }
        }
        this.form = new FormGroup(fg);
    }

    public getParameters() {
        if (this.jobTemplate) {
            return Object.keys(this.jobTemplate["parameters"]);
        } else {
            return [];
        }
    }

    @autobind()
    public submit() {
        console.log("submit");
        const formItem = this.form.value;
        console.log(formItem);
        // RPC takes in Template JSON object and Parameter JSON object
        const obs = this.pythonRpcService.callWithAuth("submitNCJ", [this._buildJobTemplate(), formItem]);
        obs.subscribe({
            next: (data) => console.log("Submitted NCJ package", data),
            error: (err) => console.log("Error NCJ package", err),
        });
    }

    private _getTemplates() {
        this.templateService.getTemplates(this.applicationId, this.actionId).subscribe((templates) => {
            this.jobTemplate = templates.job;
            this.poolTemplate = templates.pool;
            console.log("Job", this.jobTemplate);
            console.log("Pool", this.poolTemplate);
            this.createForms();
        });
    }

    private _buildJobTemplate(): any {
        const template = { ...this.jobTemplate };
        template.job.properties.poolInfo = {
            poolId: "some-pool",
        };
        console.log("Template", template);
        return template;
    }

    private _updateTitle() {
        this.title = `Run ${this.actionId} from ${this.applicationId}`;
    }
}
