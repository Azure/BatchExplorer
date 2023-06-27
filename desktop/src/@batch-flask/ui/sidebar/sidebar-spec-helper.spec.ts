import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { MatSidenav } from "@angular/material/sidenav";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { MaterialModule } from "@batch-flask/core";
import { SidebarContentComponent } from "./sidebar-content";
import { GlobalSidebarService } from "./sidebar-manager";
import { SidebarModule } from "./sidebar.module";

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
        <mat-sidenav-container>
                <mat-sidenav #rightSidebar align="end">
                    <bl-sidebar-content #sidebarContent [sidebar]="rightSidebar"></bl-sidebar-content>
                </mat-sidenav>
                <div>Content</div>
        </mat-sidenav-container>
    `,
})
export class AppTestComponent implements AfterViewInit {
    @ViewChild("rightSidebar", { static: false })
    public sidebar: MatSidenav;
    @ViewChild("sidebarContent", { static: false })
    public sidebarContent: SidebarContentComponent;

    constructor(private sidebarManager: GlobalSidebarService) {
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
        imports: [SidebarModule, MaterialModule, NoopAnimationsModule],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
        set: {
            entryComponents: [AppTestComponent, FakeComponent],
        },
    });
    TestBed.compileComponents();
}
