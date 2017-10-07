import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "app/core";

// components
import { IconComponent } from "app/components/base/icon";
import { AdvancedFilterModule } from "./advanced-filter";
import { BackgroundTaskModule } from "./background-task";
import { BannerComponent, BannerOtherFixDirective } from "./banner";
import { BreadcrumbModule } from "./breadcrumbs";
import { ButtonsModule } from "./buttons";
import { ChartsModule } from "./charts";
import { ContextMenuModule } from "./context-menu";
import { DialogsModule } from "./dialogs";
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
import { SimpleDialogComponent } from "./simple-dialog";
import { SplitPaneModule } from "./split-pane";
import { TableModule } from "./table";
import { TabsModule } from "./tabs";
import { TagsModule } from "./tags";
import { VirtualScrollModule } from "./virtual-scroll";

// Add submodules there
const modules = [
    AdvancedFilterModule,
    BreadcrumbModule,
    ButtonsModule,
    BackgroundTaskModule,
    ChartsModule,
    ContextMenuModule,
    DialogsModule,
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
    TagsModule,
    FormModule,
    ScrollableModule,
    SplitPaneModule,
    VirtualScrollModule,
];

// Add subcomponnent not in a module here
const components = [
    BannerComponent,
    BannerOtherFixDirective,
    ElapsedTimeComponent,
    EntityDetailsListComponent,
    IconComponent,
    ListAndShowLayoutComponent,
    SimpleLoadingComponent,
    SimpleDialogComponent,
    LoadingComponent,
    RefreshButtonComponent,
    ListLoadingComponent,
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
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: BaseModule,
            providers: [],
        };
    }
}
