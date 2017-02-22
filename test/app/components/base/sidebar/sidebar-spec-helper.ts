import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { MaterialModule, MdSidenav } from "@angular/material";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";

import { SidebarContentComponent, SidebarManager, SidebarModule } from "app/components/base/sidebar";

@Component({
    template: "<h1>{{text}}</h1>",
})
export class FakeComponent {
    public text = "Some component content";
}

/**
 * This is a test component that simulate an app with a sidebar.
 */
@Component({
    template: `
        <md-sidenav-layout>
                <md-sidenav #rightSidebar align="end">
                    <bl-sidebar-content #sidebarContent [sidebar]="rightSidebar"></bl-sidebar-content>
                </md-sidenav>
                <div>Content</div>
        </md-sidenav-layout>
    `,
})
export class AppTestComponent implements AfterViewInit {
    @ViewChild("rightSidebar")
    public sidebar: MdSidenav;
    @ViewChild("sidebarContent")
    public sidebarContent: SidebarContentComponent;

    constructor(private sidebarManager: SidebarManager) {
    }

    public ngAfterViewInit() {
        // Give the reference to the sidebar to the sidebar manager
        this.sidebarManager.sidebar = this.sidebar;
        this.sidebarManager.sidebarContent = this.sidebarContent;
    }
}

/**
 * Setup angular testing module for testing the sidebar.
 */
export function setupSidebarTest() {
    TestBed.configureTestingModule({
        declarations: [FakeComponent, AppTestComponent],
        imports: [SidebarModule.forRoot(), MaterialModule.forRoot()],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
        set: {
            entryComponents: [AppTestComponent, FakeComponent],
        },
    });
    TestBed.compileComponents();
}
