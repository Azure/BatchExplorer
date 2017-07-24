import { Component } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { PythonRpcService } from "app/services";
import {autobind} from "core-decorators";
//python python/main.py

import "./market-home.scss";

@Component({
    selector: "bl-market-home",
    templateUrl: "market-home.html",
})
export class MarketHomeComponent {
    form;
    state='Page1';
    selected="";
    templates = [
        {"name": "Blender", "filecontent":  require("../templates/blender.json")},
        {"name": "Maya Windows", "filecontent":  require("../templates/mayaSoftware-basic-windows.json")},
        {"name": "Maya Linux", "filecontent": require("../templates/mayaSoftware-basic-linux.json")},
        {"name": "Arnold Windows", "filecontent": require("../templates/arnold-basic-windows.json")},
        {"name": "Arnold Linux", "filecontent": require("../templates/arnold-basic-linux.json")}
    ];

    public static breadcrumb() {
        return { name: "Market" };
    }

    @autobind()
    onSubmit() {
        const formItem = this.form.value;
        console.log(formItem);
        const obs=  this.pythonRpcService.call("submitNCJ", [JSON.parse(this.getTemplate(this.selected)["filecontent"]),formItem]);
        obs.subscribe({
            next: (data) => console.log("Got NCJ", data),
            error: (err) => console.log("Error NCJ", err),
        });

        return obs;
    }

    getTemplate(name){
        for (var i=0;i<this.templates.length;i++){
            if (this.templates[i].name==name){
                return this.templates[i];
            }
        }
    }
    getParameters(name){
        var parameters =[]
        for (var i=0;i<this.templates.length;i++){
            if (this.templates[i].name ==name){
                let parameterKeys = Object.keys(this.templates[i]["parameters"]);
                for (let j=0;j<parameterKeys.length;j++){
                    parameters.push(parameterKeys[j]);
                }
            }
        }
        return parameters;
    }

    createForms(){
        for (let i=0;i<this.templates.length;i++){
            let parameterKeys = Object.keys(this.templates[i]["parameters"]);
            let fg = {};
            for (let j=0;j<parameterKeys.length;j++){
                if ("defaultValue" in this.templates[i]["parameters"][parameterKeys[j]]){
                    fg[parameterKeys[j]] = new FormControl(String(this.templates[i]["parameters"][parameterKeys[j]]["defaultValue"]));
                }
                else{
                    fg[parameterKeys[j]] = new FormControl();
                }
            }
            this.templates[i]["form"] = new FormGroup(fg);
        }
    }
    ngOnInit(){
        this.createForms();
    }
    constructor(public formBuilder: FormBuilder, private pythonRpcService: PythonRpcService) {
            console.log("Entered Market");
            for (let i=0;i<this.templates.length;i++){
                let file = JSON.parse(this.templates[i].filecontent);
                this.templates[i]["description"] = file.templateMetadata.description;
                this.templates[i]["parameters"] = file.parameters;
            }
    }
}
