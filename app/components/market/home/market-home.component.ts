import { Component} from "@angular/core";

@Component({
    selector: "bl-market-home",
    templateUrl: "market-home.html",
})
export class MarketHomeComponent {
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
                console.log(this.templates[i]);
                var parameterKeys = Object.keys(this.templates[i]["parameters"]);
                for (var j=0;j<parameterKeys.length;j++){
                    parameters.push(parameterKeys[j]);
                }
            }
        }
        return parameters;
    }
    constructor() {
            console.log("Entered Market");
            for (var i=0;i<this.templates.length;i++){
                var file = JSON.parse(this.templates[i].filecontent);
                this.templates[i]["description"] = file.templateMetadata.description;
                this.templates[i]["parameters"] = file.parameters;
            }
    }
}
