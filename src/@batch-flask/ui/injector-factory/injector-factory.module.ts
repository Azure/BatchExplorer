import { NgModule } from "@angular/core";

const publicComponents = [];
const privateComponents = [];

@NgModule({
    imports: [],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class InjectorFactoryModule {
}
