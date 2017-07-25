import { Component } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { PythonRpcService } from "app/services";
import { autobind } from "core-decorators";
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

    //Triggers when submit button is pressed
    @autobind()
    onSubmit() {
        const formItem = this.form.value;
        console.log(formItem);
        //RPC takes in Template JSON object and Parameter JSON object
        const obs = this.pythonRpcService.call("submitNCJ", [JSON.parse(this.getTemplate(this.selected)["filecontent"]), formItem]);
        obs.subscribe({
            next: (data) => console.log("Submitted NCJ package", data),
            error: (err) => console.log("Error NCJ package", err),
        });
        return obs;
    }

    //Returns template object from template name
    getTemplate(name){
        for (var i=0; i<this.templates.length; i++){
            if (this.templates[i].name==name){
                return this.templates[i];
            }
        }
    }

    //Returns an array of Parameter names from template name
    getParameters(name){
        var parameters = [];
        for (var i=0; i<this.templates.length; i++){
            if (this.templates[i].name == name){
                let parameterKeys = Object.keys(this.templates[i]["parameters"]);
                for (let j=0; j<parameterKeys.length; j++){
                    parameters.push(parameterKeys[j]);
                }
            }
        }
        return parameters;
    }

    //Initializes all form object with default values
    ngOnInit(){
        this.createForms();
    }

    //Create or Reset forms to default
    createForms(){
        for (let i=0; i<this.templates.length; i++){
            let parameterKeys = Object.keys(this.templates[i]["parameters"]);
            let fg = {};
            for (let j=0; j<parameterKeys.length; j++){
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

    //Triggered when changing page 1->2
    nextPage(template){
        this.selected=template['name'];
        this.state='Page2';
        this.createForms();
        this.form=this.getTemplate(this.selected)["form"];
    }

    //Triggered when changing page 2->1
    prevPage(){
        this.state='Page1';
        this.selected=''
    }

    //Constructor create data structure from reading json files
    constructor(public formBuilder: FormBuilder, private pythonRpcService: PythonRpcService) {
            console.log("Entered Market");
            for (let i=0; i<this.templates.length; i++){
                let file = JSON.parse(this.templates[i].filecontent);
                this.templates[i]["description"] = file.templateMetadata.description;
                this.templates[i]["parameters"] = file.parameters;
            }
    }
}
