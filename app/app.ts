import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { remote } from "electron";
import { List } from "immutable";
import * as MouseTrap from "mousetrap";

import { log } from "app/utils";
import { AppModule } from "./app.module";
import { handleCoreError } from "./error-handler";

// Setup extension methods
import "chart.js";
import "hammerjs";
import "./utils/extensions";

import "codemirror/addon/hint/show-hint.css";
import "codemirror/lib/codemirror.css";
import "font-awesome/css/font-awesome.min.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "./environment";
import "./styles/main.scss";

import { ListProp, Model, Prop, Record } from "app/core/record";
import { AccountResource } from "app/models";
(remote.getCurrentWindow() as any).splashScreen.updateMessage("Initializing app");
const platform = platformBrowserDynamic();

platform.bootstrapModule(AppModule)
    .catch(error => {
        log.error("Bootstrapping failed :: ", error);
        handleCoreError(error);
    });

MouseTrap.bind("ctrl+shift+i", () => {
    if (remote.getCurrentWindow().webContents.isDevToolsOpened()) {
        remote.getCurrentWindow().webContents.closeDevTools();
    } else {
        remote.getCurrentWindow().webContents.openDevTools();
    }
});

// @Model()
// class NestedRec extends Record<any> {
//     @Prop()
//     public name: string = "default-name";
// }

// @Model()
// class TestRec extends Record<any> {
//     @Prop()
//     public id: string = "default-id";

//     @Prop()
//     public nested: NestedRec;

//     @ListProp(NestedRec)
//     public nestedList: List<NestedRec> = List([]);
// }

// @Model()
// class InheritedTestRec extends TestRec {
//     @Prop()
//     public d: number;
// }

// // console.log("new ", new TestRec({ id: "id-1", nested: { name: "name-1" } }));
// const obj = new InheritedTestRec({ id: "id-1", d: 4, nested: { name: "name-1" } });
// console.log("new2 ", obj);
// console.log("new3 ", new InheritedTestRec(obj));

// const acc = new AccountResource({ id: "acc-1", subscription: { subscriptionId: "sub-1", id: "long/id-1" } });

// console.log("Acc", acc);
// console.log("Acc2", new AccountResource(acc));
