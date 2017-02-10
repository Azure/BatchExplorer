import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

// components
import { AdvancedFilterModule } from "./advanced-filter";
import { BackgroundTaskModule } from "./background-task";
import { BannerComponent, BannerOtherFixDirective } from "./banner";
import { BreadcrumbModule } from "./breadcrumbs";
import { ButtonsModule } from "./buttons";
import { DropdownModule } from "./dropdown";
import { ElapsedTimeComponent } from "./elapsed-time";
import { FocusSectionModule } from "./focus-section";
import { FormModule } from "./form";
import { InfoBoxModule } from "./info-box";
import {
    DeleteSelectedItemsDialogComponent, EntityDetailsListComponent, ListAndShowLayoutComponent, ListLoadingComponent,
} from "./list-and-show-layout";
import { LoadingComponent } from "./loading";
import { NotificationModule } from "./notifications";
import { PropertyListModule } from "./property-list";
import { QuickListModule } from "./quick-list";
import { RefreshButtonComponent } from "./refresh-btn";
import { ScrollableComponent, ScrollableService } from "./scrollable";
import { SidebarModule } from "./sidebar";
import { TableModule } from "./table";
import { TabsModule } from "./tabs";

// Add submodules there
const modules = [
    AdvancedFilterModule,
    BreadcrumbModule,
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
    TabsModule,
    FormModule,
];

// Add subcomponnent not in a module here
const components = [
    BannerComponent,
    BannerOtherFixDirective,
    ElapsedTimeComponent,
    EntityDetailsListComponent,
    ListAndShowLayoutComponent,
    LoadingComponent,
    ScrollableComponent,
    RefreshButtonComponent,
    ListLoadingComponent,
    DeleteSelectedItemsDialogComponent,
];

@NgModule({
    declarations: components,
    entryComponents: [
        DeleteSelectedItemsDialogComponent,
    ],
    exports: [...modules, ...components],
    imports: [
        BrowserModule,
        FormsModule,
        MaterialModule,
        ReactiveFormsModule,
        RouterModule,
        ...modules,
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
