// import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
// import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from "@angular/core/testing";
// import { FormControl, ReactiveFormsModule } from "@angular/forms";
// import { BrowserModule, By } from "@angular/platform-browser";
// import { ServerError } from "@batch-flask/core";
// import { Observable } from "rxjs";

// import { JobService } from "app/services";
// import { JobIdComponent } from "./job-id.component";

// import * as Fixtures from "test/fixture";

// @Component({
//     template: `<bl-job-id [formControl]="jobId"></bl-job-id>`,
// })
// class TestComponent {
//     public jobId = new FormControl("");
// }

// describe("JobIdComponent", () => {
//     let fixture: ComponentFixture<TestComponent>;
//     let testComponent: TestComponent;
//     let de: DebugElement;
//     let jobServiceSpy;

//     const error = "The job ID has already been used, please choose a unique job ID";

//     beforeEach(() => {
//         jobServiceSpy = {
//             get: jasmine.createSpy("get").and.callFake((jobId, ...args) => {
//                 if (jobId === "not-found") {
//                     return Observable.throw(ServerError.fromBatch({
//                         statusCode: 404,
//                         code: "RandomTestErrorCode",
//                         message: { value: "Try again ..." },
//                     }));
//                 }

//                 return Observable.of(Fixtures.job.create({ id: jobId }));
//             }),
//         };

//         TestBed.configureTestingModule({
//             imports: [
//                 BrowserModule,
//                 ReactiveFormsModule,
//             ],
//             declarations: [
//                 JobIdComponent,
//                 TestComponent,
//             ],
//             providers: [
//                 { provide: JobService, useValue: jobServiceSpy },
//             ],
//             schemas: [NO_ERRORS_SCHEMA],
//         });

//         fixture = TestBed.createComponent(TestComponent);
//         testComponent = fixture.componentInstance;
//         de = fixture.debugElement.query(By.css("bl-job-id"));
//         fixture.detectChanges();
//     });

//     it("Validate success when job not found", fakeAsync(() => {
//         testComponent.jobId.setValue("not-found");
//         fixture.detectChanges();
//         tick(250);

//         expect(testComponent.jobId.valid).toBe(true);
//         expect(testComponent.jobId.status).toBe("VALID");
//         expect(de.nativeElement.textContent).not.toContain(error);
//         discardPeriodicTasks();
//     }));

//     it("Validate fail when existing job found", fakeAsync(() => {
//         testComponent.jobId.setValue("found");
//         fixture.detectChanges();
//         tick(250);
//         fixture.detectChanges();

//         expect(testComponent.jobId.valid).toBe(false);
//         expect(testComponent.jobId.status).toBe("INVALID");
//         expect(de.nativeElement.textContent).toContain(error);
//         discardPeriodicTasks();
//     }));
// });
