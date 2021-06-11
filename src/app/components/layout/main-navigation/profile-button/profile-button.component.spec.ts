import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTooltip, MatTooltipModule } from "@angular/material/tooltip";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { LocaleService } from "@batch-flask/core";
import { I18nTestingModule } from "@batch-flask/core/testing";
import {
    AutoUpdateService, ElectronRemote, ElectronShell, FileSystemService, UpdateStatus,
} from "@batch-flask/electron";
import {
    ClickableComponent,
    ContextMenuItem,
    ContextMenuSeparator,
    MultiContextMenuItem,
} from "@batch-flask/ui";
import { AuthService, BatchExplorerService } from "app/services";
import { ProgressInfo } from "builder-util-runtime";
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
    let authServiceSpy;
    let autoUpdateServiceSpy;
    let batchExplorerServiceSpy;
    let contextMenuServiceSpy: ContextMenuServiceMock;
    let notificationServiceSpy: NotificationServiceMock;
    let checkForUpdatesResponse: Promise<any>;

    beforeEach(() => {
        checkForUpdatesResponse = Promise.resolve({ updateInfo: { version: "1.2.4" } });
        contextMenuServiceSpy = new ContextMenuServiceMock();
        notificationServiceSpy = new NotificationServiceMock();
        authServiceSpy = {
            currentUser: new BehaviorSubject(null),
        };

        autoUpdateServiceSpy = {
            status: new BehaviorSubject<UpdateStatus>(null),
            downloadProgress: new BehaviorSubject<ProgressInfo>(null),
            checkForUpdates: jasmine.createSpy("checkForUpdates").and.callFake(() => checkForUpdatesResponse),
        };

        batchExplorerServiceSpy = {};
        TestBed.configureTestingModule({
            imports: [MatTooltipModule, RouterTestingModule, I18nTestingModule, MatProgressSpinnerModule],
            declarations: [ProfileButtonComponent, ClickableComponent, TestComponent],
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
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
        authServiceSpy.currentUser.next({
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
        expect(items.length).toBe(13);
    });

    describe("Clicking on the profile", () => {
        it("It shows a context menu", () => {
            click(clickableEl);
            expect(contextMenuServiceSpy.openMenu).toHaveBeenCalled();
            const items = contextMenuServiceSpy.lastMenu.items;
            expect(items.length).toEqual(13);

            expect(items[0] instanceof ContextMenuItem).toBe(true);
            expect((items[0] as ContextMenuItem).label).toEqual("Check for updates");

            expect(items[1] instanceof ContextMenuSeparator).toBe(true);

            expect(items[2] instanceof ContextMenuItem).toBe(true);
            expect((items[2] as ContextMenuItem).label).toEqual("profile-button.settings");

            expect(items[3] instanceof ContextMenuItem).toBe(true);
            expect((items[3] as ContextMenuItem).label).toEqual("profile-button.keybindings");

            expect(items[4] instanceof MultiContextMenuItem).toBe(true);
            expect((items[4] as MultiContextMenuItem).label).toEqual("Language (Preview)");

            expect(items[5] instanceof ContextMenuItem).toBe(true);
            expect((items[5] as ContextMenuItem).label).toEqual("profile-button.thirdPartyNotices");

            expect(items[6] instanceof ContextMenuItem).toBe(true);
            expect((items[6] as ContextMenuItem).label).toEqual("profile-button.viewLogs");

            expect(items[7] instanceof ContextMenuItem).toBe(true);
            expect((items[7] as ContextMenuItem).label).toEqual("profile-button.report");

            expect(items[8] instanceof ContextMenuItem).toBe(true);
            expect((items[8] as ContextMenuItem).label).toEqual("profile-button.about");

            expect(items[9] instanceof ContextMenuSeparator).toBe(true);

            expect(items[10] instanceof ContextMenuItem).toBe(true);
            expect((items[10] as ContextMenuItem).label).toEqual("profile-button.viewTheme");

            expect(items[11] instanceof ContextMenuSeparator).toBe(true);

            expect(items[12] instanceof ContextMenuItem).toBe(true);
            expect((items[12] as ContextMenuItem).label).toEqual("profile-button.logout");
        });

        it("check for updates and show update notification when there is one", fakeAsync(() => {
            expect(autoUpdateServiceSpy.checkForUpdates).toHaveBeenCalledTimes(1);
            click(clickableEl);
            const items = contextMenuServiceSpy.lastMenu.items;
            (items[0] as ContextMenuItem).click();
            expect(autoUpdateServiceSpy.checkForUpdates).toHaveBeenCalledTimes(2);
            tick(100);
            expect(notificationServiceSpy.info).toHaveBeenCalledOnce();
            expect(notificationServiceSpy.info).toHaveBeenCalledWith(
                "Update available",
                "Update 1.2.4 is now available.", {
                    action: jasmine.anything(),
                });
            expect(notificationServiceSpy.error).not.toHaveBeenCalled();

        }));

        it("check for updates and show no update available notification when there isn't one", fakeAsync(() => {
            checkForUpdatesResponse = Promise.resolve(null);

            expect(autoUpdateServiceSpy.checkForUpdates).toHaveBeenCalledTimes(1);
            click(clickableEl);
            const items = contextMenuServiceSpy.lastMenu.items;
            (items[0] as ContextMenuItem).click();
            expect(autoUpdateServiceSpy.checkForUpdates).toHaveBeenCalledTimes(2);
            tick(100);

            expect(notificationServiceSpy.info).toHaveBeenCalledOnce();
            expect(notificationServiceSpy.info).toHaveBeenCalledWith(
                "There are no updates currently available.",
                "You  have the latest BatchExplorer version.", {});
            expect(notificationServiceSpy.error).not.toHaveBeenCalled();
        }));

        it("check for updates and show no error notification when it resolve to an error", fakeAsync(() => {
            checkForUpdatesResponse = Promise.reject(new Error("Foo bar error"));
            expect(autoUpdateServiceSpy.checkForUpdates).toHaveBeenCalledTimes(1);
            click(clickableEl);
            const items = contextMenuServiceSpy.lastMenu.items;
            (items[0] as ContextMenuItem).click();
            expect(autoUpdateServiceSpy.checkForUpdates).toHaveBeenCalledTimes(2);
            tick(100);
            expect(notificationServiceSpy.error).toHaveBeenCalledOnce();
            expect(notificationServiceSpy.error).toHaveBeenCalledWith(
                "Failed to check for updates", "Error: Foo bar error");

            expect(notificationServiceSpy.info).not.toHaveBeenCalled();
        }));
    });
});
