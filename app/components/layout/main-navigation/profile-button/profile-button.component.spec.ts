import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatTooltip, MatTooltipModule } from "@angular/material";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { LocaleService } from "@batch-flask/core";
import { I18nTestingModule } from "@batch-flask/core/testing";
import {
    AutoUpdateService,
    ClickableComponent,
    ElectronRemote,
    ElectronShell,
    FileSystemService,
    I18nUIModule,
    UpdateStatus,
} from "@batch-flask/ui";
import { AdalService, BatchExplorerService } from "app/services";
import { BehaviorSubject } from "rxjs";
import { click } from "test/utils/helpers";
import { ContextMenuServiceMock, NotificationServiceMock } from "test/utils/mocks";
import { ProfileButtonComponent } from "./profile-button.component";

@Component({
    template: `<bl-profile-button></bl-profile-button>`,
})
class TestComponent {
}

describe("ProfileButtonComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let de: DebugElement;
    let clickableEl: DebugElement;
    let adalServiceSpy;
    let autoUpdateServiceSpy;
    let batchExplorerServiceSpy;
    let contextMenuServiceSpy: ContextMenuServiceMock;
    let notificationServiceSpy: NotificationServiceMock;

    beforeEach(() => {
        contextMenuServiceSpy = new ContextMenuServiceMock();
        notificationServiceSpy = new NotificationServiceMock();
        adalServiceSpy = {
            currentUser: new BehaviorSubject(null),
        };

        autoUpdateServiceSpy = {
            status: new BehaviorSubject<UpdateStatus>(null),
        };

        batchExplorerServiceSpy = {};
        TestBed.configureTestingModule({
            imports: [MatTooltipModule, RouterTestingModule, I18nTestingModule, I18nUIModule],
            declarations: [ProfileButtonComponent, ClickableComponent, TestComponent],
            providers: [
                { provide: AdalService, useValue: adalServiceSpy },
                { provide: AutoUpdateService, useValue: autoUpdateServiceSpy },
                { provide: BatchExplorerService, useValue: batchExplorerServiceSpy },
                { provide: ElectronShell, useValue: null },
                { provide: ElectronRemote, useValue: null },
                { provide: FileSystemService, useValue: null },
                { provide: LocaleService, useValue: null },
                contextMenuServiceSpy.asProvider(),
                notificationServiceSpy.asProvider(),
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        de = fixture.debugElement.query(By.css("bl-profile-button"));

        clickableEl = fixture.debugElement.query(By.css("bl-clickable"));
        fixture.detectChanges();
    });

    it("shows the current user info in tooltip", () => {
        adalServiceSpy.currentUser.next({
            name: "Some Name",
            unique_name: "some.name@example.com",
        });
        fixture.detectChanges();
        const tooltip: MatTooltip = clickableEl.injector.get(MatTooltip);
        expect(tooltip.message).toBe("Some Name (some.name@example.com)");
    });

    describe("update status", () => {
        it("flash checking icon when checking for update", () => {
            autoUpdateServiceSpy.status.next(UpdateStatus.Checking);
            fixture.detectChanges();
            const notificationOverlay = de.query(By.css(".notification-overlay"));
            expect(notificationOverlay).not.toBeFalsy();
            expect(notificationOverlay.nativeElement.classList).toContain("checking");
            expect(notificationOverlay.nativeElement.classList).not.toContain("downloading");
            expect(notificationOverlay.nativeElement.classList).not.toContain("ready");
        });

        it("shows downloading icon when downloading update", () => {
            autoUpdateServiceSpy.status.next(UpdateStatus.Downloading);
            fixture.detectChanges();
            const notificationOverlay = de.query(By.css(".notification-overlay"));
            expect(notificationOverlay).not.toBeFalsy();
            expect(notificationOverlay.nativeElement.classList).not.toContain("checking");
            expect(notificationOverlay.nativeElement.classList).toContain("downloading");
            expect(notificationOverlay.nativeElement.classList).not.toContain("ready");
        });

        it("shows ready icon when update is ready to be installed", () => {
            autoUpdateServiceSpy.status.next(UpdateStatus.Ready);
            fixture.detectChanges();
            const notificationOverlay = de.query(By.css(".notification-overlay"));
            expect(notificationOverlay).not.toBeFalsy();
            expect(notificationOverlay.nativeElement.classList).not.toContain("checking");
            expect(notificationOverlay.nativeElement.classList).not.toContain("downloading");
            expect(notificationOverlay.nativeElement.classList).toContain("ready");
        });

        it("doesn't show any overlay when no updates are available", () => {
            autoUpdateServiceSpy.status.next(UpdateStatus.NotAvailable);
            fixture.detectChanges();
            const notificationOverlay = de.query(By.css(".notification-overlay"));
            expect(notificationOverlay).toBeFalsy();
        });
    });

    it("show context menu when clicking on it", () => {
        click(clickableEl);
        fixture.detectChanges();
        expect(contextMenuServiceSpy.openMenu).toHaveBeenCalledOnce();
        const items = contextMenuServiceSpy.lastMenu.items;
        expect(items.length).toBe(12);
    });
});
