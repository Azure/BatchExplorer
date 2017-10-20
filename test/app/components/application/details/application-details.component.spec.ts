// import { Component, Input, NO_ERRORS_SCHEMA } from "@angular/core";
// import { ComponentFixture, TestBed } from "@angular/core/testing";
// import { MatDialog } from "@angular/material";
// import { By } from "@angular/platform-browser";
// import { ActivatedRoute } from "@angular/router";
// import { RouterTestingModule } from "@angular/router/testing";
// import { Observable } from "rxjs";

// import { ApplicationDetailsComponent } from "app/components/application/details";
// import { SidebarManager } from "app/components/base/sidebar";
// import { BatchApplication } from "app/models";
// import { ApplicationService } from "app/services";
// import * as Fixtures from "test/fixture";
// import { ActivatedRouteMock, RxMockEntityProxy } from "test/utils/mocks";
// import { LoadingMockComponent } from "test/utils/mocks/components";

// // mock application properties component
// @Component({
//     selector: "bl-application-properties",
//     template: "",
// })
// class ApplicationPropertiesMockComponent {
//     @Input()
//     public set application(application: BatchApplication) {
//         this._application = application;
//     }
//     public get application() { return this._application; }

//     private _application: BatchApplication;
// }

// // mock application packages component
// @Component({
//     selector: "bl-application-packages",
//     template: "",
// })
// class ApplicationPackagesMockComponent {
//     @Input()
//     public application: BatchApplication;
// }

// // mock application error component
// @Component({
//     selector: "bl-application-error-display",
//     template: "",
// })
// class ApplicationErrorDisplayMockComponent {
//     @Input()
//     public application: BatchApplication;
// }

// describe("ApplicationDetailsComponent.breadcrumb()", () => {
//     it("has correct breadcrumb name", () => {
//         const breadcrumb = ApplicationDetailsComponent.breadcrumb({ id: "app1" }, { tab: "details" });
//         expect(breadcrumb.name).toEqual("app1");
//         expect(breadcrumb.label).toEqual("Application - details");
//     });
// });

// describe("ApplicationDetailsComponent", () => {
//     let fixture: ComponentFixture<ApplicationDetailsComponent>;
//     let component: ApplicationDetailsComponent;
//     let entityProxy: RxMockEntityProxy<any, BatchApplication>;
//     let applicationServiceSpy: any;
//     let activatedRouteSpy: any;
//     let accountServiceSpy: any;
//     let matDialogSpy: any;

//     beforeEach(() => {
//         entityProxy = new RxMockEntityProxy(BatchApplication, {
//             item: Fixtures.application.create({
//                 id: "app-1",
//                 displayName: "bobs display name",
//                 allowUpdates: true,
//             }),
//         });

//         applicationServiceSpy = {
//             get: () => entityProxy,
//         };

//         accountServiceSpy = {
//             currentAccount: Observable.of({ id: "some-account" }),
//         };

//         activatedRouteSpy = new ActivatedRouteMock({
//             params: Observable.of({ id: "app-1" }),
//         });

//         matDialogSpy = {
//             open: jasmine.createSpy("open-dialog").and.callFake((...args) => {
//                 return {
//                     componentInstance: { applicationId: "" },
//                 };
//             }),
//         };

//         TestBed.configureTestingModule({
//             imports: [RouterTestingModule],
//             declarations: [
//                 ApplicationDetailsComponent, ApplicationPackagesMockComponent, ApplicationPropertiesMockComponent,
//                 ApplicationErrorDisplayMockComponent, LoadingMockComponent,
//             ],
//             providers: [
//                 { provide: MatDialog, useValue: matDialogSpy },
//                 { provide: ActivatedRoute, useValue: activatedRouteSpy },
//                 { provide: SidebarManager, useValue: null },
//                 { provide: ApplicationService, useValue: applicationServiceSpy },
//             ],
//             schemas: [NO_ERRORS_SCHEMA],
//         });

//         fixture = TestBed.createComponent(ApplicationDetailsComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     describe("loads application based on initial parameter", () => {
//         it("proxy params are set to correct id", () => {
//             expect(entityProxy.params).toEqual({ id: "app-1" });
//         });

//         it("application was fetched", () => {
//             expect(component.application).toBeDefined();
//             expect(component.application.id).toEqual("app-1");
//         });

//         it("decorator is created", () => {
//             expect(component.decorator).toBeDefined();
//             expect(component.decorator.id).toEqual("app-1");
//         });

//         describe("UI shows correct information", () => {
//             it("title is correct", () => {
//                 const container = fixture.debugElement.query(By.css("[summaryTitle]"));
//                 expect(container.nativeElement.textContent).toContain("app-1");
//             });

//             it("subtitle is correct", () => {
//                 const container = fixture.debugElement.query(By.css("[summarySubtitle]"));
//                 expect(container.nativeElement.textContent).toContain("bobs display name");
//             });

//             it("subtitle contains unlocked text for this application", () => {
//                 const container = fixture.debugElement.query(By.css("[summarySubtitle]"));
//                 expect(container.nativeElement.textContent).toContain("(unlocked)");
//             });
//         });

//         describe("Locked application shows locked icon and text", () => {
//             beforeEach(() => {
//                 component.application = Fixtures.application.create({ allowUpdates: false });
//                 fixture.detectChanges();
//             });

//             it("subtitle contains locked text", () => {
//                 const container = fixture.debugElement.query(By.css("[summarySubtitle]"));
//                 expect(container.nativeElement.textContent).toContain("(locked)");
//             });
//         });

//         describe("Delete command is shown and wired up", () => {
//             it("calling delete opens dialog", () => {
//                 component.deleteApplication();
//                 expect(matDialogSpy.open).toHaveBeenCalledTimes(1);
//             });
//         });
//     });
// });
