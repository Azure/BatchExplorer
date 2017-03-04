// tslint:disable:no-unused-variable
// tslint:disable:no-jasmine-focus
import { Component } from "@angular/core";
import { TestBed, async } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BaseModule } from "app/components/base/base.module";

import { MaterialModule } from "@angular/material";
import { AppModule } from "app/app.module";
import { AdvancedFilterModule } from "app/components/base/advanced-filter";
import { BackgroundTaskModule } from "app/components/base/background-task";
import { BannerComponent, BannerOtherFixDirective } from "app/components/base/banner";
import { BreadcrumbModule } from "app/components/base/breadcrumbs";
import { ButtonsModule } from "app/components/base/buttons";
import { ContextMenuModule } from "app/components/base/context-menu";
import { DropdownModule } from "app/components/base/dropdown";
import { ElapsedTimeComponent } from "app/components/base/elapsed-time";
import { FocusSectionModule } from "app/components/base/focus-section";
import { FormModule } from "app/components/base/form";
import { InfoBoxModule } from "app/components/base/info-box";
import {
    DeleteSelectedItemsDialogComponent, EntityDetailsListComponent, ListAndShowLayoutComponent, ListLoadingComponent,
} from "app/components/base/list-and-show-layout";
import { LoadingComponent, SimpleLoadingComponent } from "app/components/base/loading";
import { NotificationModule } from "app/components/base/notifications";
import { PropertyListModule } from "app/components/base/property-list";
import { QuickListModule } from "app/components/base/quick-list";
import { RefreshButtonComponent } from "app/components/base/refresh-btn";
import { ScrollableModule } from "app/components/base/scrollable";
import { SidebarModule } from "app/components/base/sidebar";
import { TableModule } from "app/components/base/table";
import { TabsModule } from "app/components/base/tabs";
import { TaskDetailsModule } from "app/components/task/details";

import {
    BackgroundTaskTrackerComponent, BackgroundTaskTrackerItemComponent,
} from "app/components/base/background-task";

export function main() {
    fdescribe("Memory leak Testing", () => {
        for (let i = 0; i < 100000; i++) {
            describe(`${i}`, () => {
                beforeEach(async(() => {
                    TestBed.configureTestingModule({
                        imports: [TaskDetailsModule],
                        // imports: [BaseModule],
                        // imports: [
                        //     BrowserModule,
                        //     FormsModule,
                        //     MaterialModule,
                        //     DropdownModule,
                        //     NotificationModule,
                        // ],
                        declarations: [
                            // BackgroundTaskTrackerComponent,
                            // BackgroundTaskTrackerItemComponent,
                            TestBigComponent,
                            TestComponent,
                        ],
                    }).compileComponents();
                }));

                it(`should leak memory`, () => {
                    let fixture = TestBed.createComponent(TestComponent);
                });
            });
        }

        for (let i = 0; i < 200; i++) {
            it(`cleanup ${i}`, () => { let a = 0; });
        }
    });
}

// Uncomment below to focus the above tests
// main();

@Component({ selector: "bl-cmp", template: "<div></div>" })
class TestComponent { }

@Component({ selector: "bl-big", templateUrl: "./test-big-component.html" })
class TestBigComponent { }
