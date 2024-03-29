import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";
import { AbstractListModule } from "./abstract-list";
import { ActivityModule } from "./activity";
import { AdvancedFilterModule } from "./advanced-filter";
import { AutoFocusModule } from "./auto-focus";
import { BannerComponent, BannerOtherFixDirective } from "./banner";
import { BreadcrumbModule } from "./breadcrumbs";
import { BrowseLayoutModule } from "./browse-layout";
import { ButtonsModule } from "./buttons";
import { CardModule } from "./card";
import { ChartsModule } from "./charts";
import { DateModule } from "./date";
import { DatetimePickerModule } from "./datetime-picker";
import { DialogsModule } from "./dialogs";
import { DropdownModule } from "./dropdown";
import { DurationPickerModule } from "./duration-picker";
import { EditorModule } from "./editor";
import { EntityCommandsListModule } from "./entity-commands-list";
import { FileModule } from "./file";
import { FocusSectionModule } from "./focus-section";
import { FormModule } from "./form";
import { GraphsModule } from "./graphs";
import { I18nUIModule } from "./i18n";
import { IconComponent } from "./icon";
import { InfoBoxModule } from "./info-box";
import { EntityDetailsListComponent } from "./list-and-show-layout";
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
import { ToolbarModule } from "./toolbar";
import { VirtualScrollModule } from "./virtual-scroll";
import { VTabsModule } from "./vtabs";
import { WorkspaceModule } from "./workspace";

// Add submodules there
const modules = [
    AbstractListModule,
    ActivityModule,
    AdvancedFilterModule,
    AutoFocusModule,
    BreadcrumbModule,
    BrowseLayoutModule,
    ButtonsModule,
    CardModule,
    ChartsModule,
    DateModule,
    DatetimePickerModule,
    DialogsModule,
    DropdownModule,
    DurationPickerModule,
    EditorModule,
    EntityCommandsListModule,
    FileModule,
    FocusSectionModule,
    FormModule,
    GraphsModule,
    I18nUIModule,
    InfoBoxModule,
    LoadingModule,
    MetricsMonitorModule,
    NotificationModule,
    PermissionModule,
    PropertyListModule,
    QuickListModule,
    QuotasModule,
    ScrollableModule,
    SelectModule,
    ServerErrorModule,
    SidebarModule,
    SplitPaneModule,
    SummaryCardModule,
    TableModule,
    TabsModule,
    TagsModule,
    ToolbarModule,
    VTabsModule,
    VirtualScrollModule,
    WorkspaceModule,
];

// Add subcomponent not in a module here
const components = [
    BannerComponent,
    BannerOtherFixDirective,
    EntityDetailsListComponent,
    IconComponent,
    SimpleDialogComponent,
    TimespanComponent
];

@NgModule({
    declarations: components,
    entryComponents: [
        SimpleDialogComponent,
    ],
    exports: [...modules, ...components],
    imports: [
        CommonModule,
        FormsModule,
        MaterialModule,
        ReactiveFormsModule,
        RouterModule,
        ...modules,
    ],
})
export class BaseModule {
}
