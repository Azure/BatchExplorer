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
    public applicationId: string;
    public actionId: string;

    private _paramsSubscriber: Subscription;

    form;
    state = "Page1";
    selected = "";
    templates = [
        { name: "Blender", filecontent: require("../templates/blender.json") },
        { name: "Maya Windows", filecontent: require("../templates/mayaSoftware-basic-windows.json") },
        { name: "Maya Linux", filecontent: require("../templates/mayaSoftware-basic-linux.json") },
        { name: "Arnold Windows", filecontent: require("../templates/arnold-basic-windows.json") },
        { name: "Arnold Linux", filecontent: require("../templates/arnold-basic-linux.json") },
    ];

    public static breadcrumb() {
        return { name: "Market" };
    }

    // Constructor create data structure from reading json files
    constructor(
        public formBuilder: FormBuilder,
        private pythonRpcService: PythonRpcService,
        private route: ActivatedRoute,
        private templateService: NcjTemplateService) {
        console.log("Entered Market");
        for (let i = 0; i < this.templates.length; i++) {
            let file = JSON.parse(this.templates[i].filecontent);
            this.templates[i]["description"] = file.templateMetadata.description;
            this.templates[i]["parameters"] = file.parameters;
        }
    }

    public ngOnInit() {
        this._paramsSubscriber = this.route.params.subscribe((params) => {
            this.applicationId = params["applicationId"];
            this.actionId = params["actionId"];
            this._getTemplates();
        });
        this.createForms();
    }

    private _getTemplates() {
        this.templateService.getTemplates(this.applicationId, this.actionId).subscribe((templates) => {
            const jobTemplate = templates.job;

            console.log("Job", jobTemplate);
        });
    }

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
    }

    // Returns template object from template name
    getTemplate(name) {
        for (let i = 0; i < this.templates.length; i++) {
            if (this.templates[i].name === name) {
                return this.templates[i];
            }
        }
    }

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

    // Create or Reset forms to default
    createForms() {
        for (let i = 0; i < this.templates.length; i++) {
            let parameterKeys = Object.keys(this.templates[i]["parameters"]);
            let fg = {};
            for (let j = 0; j < parameterKeys.length; j++) {
                if ("defaultValue" in this.templates[i]["parameters"][parameterKeys[j]]) {
                    fg[parameterKeys[j]] = new FormControl(String(this.templates[i]["parameters"][parameterKeys[j]]["defaultValue"]));
                }
                else {
                    fg[parameterKeys[j]] = new FormControl();
                }
            }
            this.templates[i]["form"] = new FormGroup(fg);
        }
    }

    // Triggered when changing page 1->2
    nextPage(template) {
        this.selected = template["name"];
        this.state = "Page2";
        this.createForms();
        this.form = this.getTemplate(this.selected)["form"];
    }

    // Triggered when changing page 2->1
    prevPage() {
        this.state = "Page1";
        this.selected = "";
    }
}
