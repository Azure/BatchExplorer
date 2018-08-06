import { ModuleWithProviders, NgModule } from "@angular/core";
import { ActivityService } from "./activity.service";

@NgModule({
    providers: [
        ActivityService,
    ],
})
export class ActivityModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: ActivityModule,
            providers: [],
        };
    }
}
