import { NgModule } from "@angular/core";
import { InjectorFactory } from "./injector-factory.service";

const publicComponents = [];
const privateComponents = [];

@NgModule({
    imports: [],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
    providers: [
        InjectorFactory,
    ],
})
export class InjectorFactoryModule {
}
