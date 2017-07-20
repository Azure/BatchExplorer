import {Component} from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { FormBuilder } from "@angular/forms";


@Component({
    selector: "bl-market-home",
    templateUrl: "market-home.html",
})
export class MarketHomeComponent {
    form;
    state='Page1';
    selected="";
    templates = [ 
        {"name": "Maya Windows", "filecontent":  require("../templates/mayaSoftware-basic-windows.json")},
        {"name": "Maya Linux", "filecontent": require("../templates/mayaSoftware-basic-linux.json")},
        {"name": "Arnold Windows", "filecontent": require("../templates/arnold-basic-windows.json")},
        {"name": "Arnold Linux", "filecontent": require("../templates/arnold-basic-linux.json")}
    ];

    public static breadcrumb() {
        return { name: "Market" };
    }

    onSubmit(formItem){
        console.log(formItem);
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
            if (this.templates[i].name==name){
                var parameterKeys = Object.keys(this.templates[i]["parameters"]);
                for (var j=0;j<parameterKeys.length;j++){
                    parameters.push(parameterKeys[j]);
                }
            }
        }
        return parameters;
    }

    createForms(){
        for (var i=0;i<this.templates.length;i++){
            var parameterKeys = Object.keys(this.templates[i]["parameters"]);
            var fg = {};
            for (var j=0;j<parameterKeys.length;j++){
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
    constructor(public formBuilder: FormBuilder) {
            console.log("Entered Market");
            for (var i=0;i<this.templates.length;i++){
                var file = JSON.parse(this.templates[i].filecontent);
                this.templates[i]["description"] = file.templateMetadata.description;
                this.templates[i]["parameters"] = file.parameters;
            }
    }
}
