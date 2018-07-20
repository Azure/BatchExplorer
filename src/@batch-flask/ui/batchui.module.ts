import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";

// components
import { ActivityModule } from "./activity-monitor";
import { AdvancedFilterModule } from "./advanced-filter";
import { BackgroundTaskModule } from "./background-task";
import { BannerComponent, BannerOtherFixDirective } from "./banner";
import { BatchFlaskSettingsModule } from "./batch-flask-settings";
import { BreadcrumbModule } from "./breadcrumbs";
import { BrowseLayoutModule } from "./browse-layout";
import { ButtonsModule } from "./buttons";
import { CardComponent } from "./card";
import { ChartsModule } from "./charts";
import { ContextMenuModule } from "./context-menu";
import { DatetimePickerComponent } from "./datetime-picker";
import { DialogsModule } from "./dialogs";
import { DropdownModule } from "./dropdown";
import { DurationPickerModule } from "./duration-picker";
import { EditorModule } from "./editor";
import { ElectronModule } from "./electron";
import { EntityCommandsListModule } from "./entity-commands-list";
import { FocusSectionModule } from "./focus-section";
import { FormModule } from "./form";
import { GraphsModule } from "./graphs";
import { IconComponent } from "./icon";
import { InfoBoxModule } from "./info-box";
import {
    DeleteSelectedItemsDialogComponent, EntityDetailsListComponent,
} from "./list-and-show-layout";
import { LoadingModule } from "./loading";
import { MetricsMonitorModule } from "./metrics-monitor";
import { NotificationModule } from "./notifications";
import { PermissionModule } from "./permission";
import { PropertyListModule } from "./property-list";
import { QuickListModule } from "./quick-list";
import { QuotasModule } from "./quotas";
import { ScrollableModule } from "./scrollable";
import { SelectModule } from "./select";
import { ServerErrorModule } from "./server-error";
import { SidebarModule } from "./sidebar";
import { SimpleDialogComponent } from "./simple-dialog";
import { SplitPaneModule } from "./split-pane";
import { SummaryCardModule } from "./summary-card";
import { TableModule } from "./table";
import { TabsModule } from "./tabs";
import { TagsModule } from "./tags";
import { TimespanComponent } from "./timespan";
import { VirtualScrollModule } from "./virtual-scroll";
import { VTabsModule } from "./vtabs";

// Add submodules there
const modules = [
    ActivityModule,
    AdvancedFilterModule,
    BatchFlaskSettingsModule,
    BreadcrumbModule,
    BrowseLayoutModule,
    ButtonsModule,
    BackgroundTaskModule,
    ChartsModule,
    ContextMenuModule,
    DialogsModule,
    DropdownModule,
    DurationPickerModule,
    EditorModule,
    EntityCommandsListModule,
    FocusSectionModule,
    InfoBoxModule,
    LoadingModule,
    MetricsMonitorModule,
    NotificationModule,
    PermissionModule,
    PropertyListModule,
    GraphsModule,
    QuickListModule,
    SidebarModule,
    TableModule,
    TabsModule,
    TagsModule,
    FormModule,
    QuotasModule,
    ServerErrorModule,
    ScrollableModule,
    SelectModule,
    SplitPaneModule,
    SummaryCardModule,
    VirtualScrollModule,
    VTabsModule,
    ElectronModule,
];

// Add subcomponnent not in a module here
const components = [
    BannerComponent,
    BannerOtherFixDirective,
    CardComponent,
    TimespanComponent,
    EntityDetailsListComponent,
    DatetimePickerComponent,
    IconComponent,
    SimpleDialogComponent,
    DeleteSelectedItemsDialogComponent,
];

@NgModule({
    declarations: components,
    entryComponents: [
        DeleteSelectedItemsDialogComponent,
        SimpleDialogComponent,
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
}
