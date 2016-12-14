import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

// components
import { routes } from "../../app.routes";
import { AdvancedFilterModule } from "./advanced-filter";
import { BackgroundTaskModule } from "./background-task";
import { BannerComponent } from "./banner";
import { BreadcrumbsComponent, CrumbComponent } from "./breadcrumbs";
import { ButtonsModule } from "./buttons";
import { DropdownModule } from "./dropdown";
import { ElapsedTimeComponent } from "./elapsed-time";
import { FocusSectionModule } from "./focus-section";
import { FormModule } from "./form";
import { InfoBoxModule } from "./info-box";
import {
    DeletePoolDialogComponent, EntityDetailsListComponent, ListAndShowLayoutComponent, ListLoadingComponent,
} from "./list-and-show-layout";
import { LoadingComponent } from "./loading";
import { NotificationModule } from "./notifications";
import { PropertyListModule } from "./property-list";
import { QuickListModule } from "./quick-list";
import { RefreshButtonComponent } from "./refresh-btn";
import { ScrollableComponent, ScrollableService } from "./scrollable";
import { SidebarModule } from "./sidebar";
import { TableModule } from "./table";

// Add submodules there
const modules = [
    AdvancedFilterModule,
    ButtonsModule,
    BackgroundTaskModule,
    DropdownModule,
    FocusSectionModule,
    InfoBoxModule,
    NotificationModule,
    PropertyListModule,
    QuickListModule,
    SidebarModule,
    TableModule,
    FormModule,
];

// Add subcomponnent not in a module here
const components = [
    BannerComponent,
    BreadcrumbsComponent,
    CrumbComponent,
    ElapsedTimeComponent,
    EntityDetailsListComponent,
    ListAndShowLayoutComponent,
    LoadingComponent,
    ScrollableComponent,
    RefreshButtonComponent,
    ListLoadingComponent,
    DeletePoolDialogComponent,
];

@NgModule({
    declarations: components,
    entryComponents: [
        DeletePoolDialogComponent,
    ],
    exports: [...modules, ...components],
    imports: [
        BrowserModule,
        FormsModule,
        MaterialModule.forRoot(),
        ReactiveFormsModule,
        RouterModule.forRoot(routes, { useHash: true }),
        ...modules.map(x => x.forRoot()),
    ],
    providers: [
        ScrollableService,
    ],
})
export class BaseModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: BaseModule,
            providers: [],
        };
    }
}
