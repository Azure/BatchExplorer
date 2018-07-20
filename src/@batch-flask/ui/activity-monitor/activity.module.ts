import { ModuleWithProviders, NgModule } from "@angular/core";
import { ActivityService } from "@batch-flask/ui/activity-monitor";

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
