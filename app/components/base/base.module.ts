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
import { ContextMenuModule } from "./context-menu";
import { DropdownModule } from "./dropdown";
import { EditorModule } from "./editor";
import { ElapsedTimeComponent } from "./elapsed-time";
import { FocusSectionModule } from "./focus-section";
import { FormModule } from "./form";
import { GraphsModule } from "./graphs";
import { InfoBoxModule } from "./info-box";
import {
    DeleteSelectedItemsDialogComponent, EntityDetailsListComponent, ListAndShowLayoutComponent, ListLoadingComponent,
} from "./list-and-show-layout";
import { LoadingComponent, SimpleLoadingComponent } from "./loading";
import { NotificationModule } from "./notifications";
import { PropertyListModule } from "./property-list";
import { QuickListModule } from "./quick-list";
import { RefreshButtonComponent } from "./refresh-btn";
import { ScrollableModule } from "./scrollable";
import { SidebarModule } from "./sidebar";
import { TableModule } from "./table";
import { TabsModule } from "./tabs";

// Add submodules there
const modules = [
    AdvancedFilterModule,
    BreadcrumbModule,
    ButtonsModule,
    BackgroundTaskModule,
    ContextMenuModule,
    DropdownModule,
    EditorModule,
    FocusSectionModule,
    InfoBoxModule,
    NotificationModule,
    PropertyListModule,
    GraphsModule,
    QuickListModule,
    SidebarModule,
    TableModule,
    TabsModule,
    FormModule,
    ScrollableModule,
];

// Add subcomponnent not in a module here
const components = [
    BannerComponent,
    BannerOtherFixDirective,
    ElapsedTimeComponent,
    EntityDetailsListComponent,
    ListAndShowLayoutComponent,
    SimpleLoadingComponent,
    LoadingComponent,
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
