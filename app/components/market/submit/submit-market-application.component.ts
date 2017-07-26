import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";

import { NcjTemplateService, PythonRpcService } from "app/services";
import "./submit-market-application.scss";

@Component({
    selector: "bl-submit-market-application",
    templateUrl: "submit-market-application.html",
})
export class SubmitMarketApplicationComponent implements OnInit {
    public applicationId: string;
    public actionId: string;
    private _paramsSubscriber: Subscription;
    jobTemplate;
    poolTemplate;
    form;
    public static breadcrumb() {
        return { name: "Submit" };
    }

    // Constructor create data structure from reading json files
    constructor(
        public formBuilder: FormBuilder,
        private pythonRpcService: PythonRpcService,
        private route: ActivatedRoute,
        private templateService: NcjTemplateService) {
        this.form = new FormGroup({"a":new FormControl()});
        console.log("Entered Market");
    }

    createForms() {
        let parameterKeys = Object.keys(this.jobTemplate["parameters"]);
        console.log("Create forms");
        let fg = {};
        for (let j = 0; j < parameterKeys.length; j++) {
            if ("defaultValue" in this.jobTemplate["parameters"][parameterKeys[j]]) {
                fg[parameterKeys[j]] = new FormControl(String(this.jobTemplate["parameters"][parameterKeys[j]]["defaultValue"]));
            }
            else {
                fg[parameterKeys[j]] = new FormControl();
            }
        }
        this.form = new FormGroup(fg);
    }

    getParameters() {
        if (this.jobTemplate){
            return Object.keys(this.jobTemplate["parameters"]);
        }
        else{
            return [];
        }
    }

    public ngOnInit() {
        this._paramsSubscriber = this.route.params.subscribe((params) => {
            this.applicationId = params["applicationId"];
            this.actionId = params["actionId"];
            this._getTemplates();
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

    onSubmit(){
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

    private _buildJobTemplate(): any {
        const template = {...this.jobTemplate};
        template.job.properties.poolInfo = {
            poolId: "some-pool",
        }
        console.log("Template", template);
        return template;
    }

    /*
    // Triggers when submit button is pressed
    @autobind()
    onSubmit() {
        const formItem = this.form.value;
        console.log(formItem);
        // RPC takes in Template JSON object and Parameter JSON object
        const obs = this.pythonRpcService.callWithAuth("submitNCJ", [JSON.parse(this.getTemplate(this.selected)["filecontent"]), formItem]);
        obs.subscribe({
            next: (data) => console.log("Submitted NCJ package", data),
            error: (err) => console.log("Error NCJ package", err),
        });
        return obs;
    }*/


    /*
    // Returns template object from template name
    getTemplate(name) {
        for (let i = 0; i < this.templates.length; i++) {
            if (this.templates[i].name === name) {
                return this.templates[i];
            }
        }
    }*/


    /*
    // Returns an array of Parameter names from template name
    getParameters(name) {
        let parameters = [];
        for (let i = 0; i < this.templates.length; i++) {
            if (this.templates[i].name === name) {
                let parameterKeys = Object.keys(this.templates[i]["parameters"]);
                for (let j = 0; j < parameterKeys.length; j++) {
                    parameters.push(parameterKeys[j]);
                }
            }
        }
        return parameters;
    }
    */
}
