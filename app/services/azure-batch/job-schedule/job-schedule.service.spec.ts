import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { JobSchedule, JobScheduleState } from "app/models";
import { JobSchedulePatchDto } from "app/models/dtos";
import { JobScheduleService } from "./job-schedule.service";

describe("JobScheduleService", () => {
    let jobScheduleService: JobScheduleService;
    let httpMock: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
            ],
            providers: [
                JobScheduleService,
            ],
        });
        jobScheduleService = new JobScheduleService(TestBed.get(HttpClient));
        httpMock = TestBed.get(HttpTestingController);
    });

    it("get a jobSchedule", (done) => {
        jobScheduleService.get("job-schedule-1").subscribe((jobSchedule: JobSchedule) => {
            expect(jobSchedule instanceof JobSchedule).toBe(true);
            expect(jobSchedule.id).toEqual("job-schedule-1");
            expect(jobSchedule.displayName).toEqual("JobSchedule 1");
            expect(jobSchedule.state).toEqual(JobScheduleState.disabled);
            done();
        });

        const req = httpMock.expectOne({
            url: "/jobschedules/job-schedule-1",
            method: "GET",
        });
        expect(req.request.body).toBe(null);
        req.flush({
            id: "job-schedule-1",
            displayName: "JobSchedule 1",
            state: "disabled",
        });
        httpMock.verify();
    });

    it("list jobSchedule", (done) => {
        jobScheduleService.list().subscribe((response) => {
            const jobSchedules = response.items;
            expect(jobSchedules.size).toBe(1);
            const jobSchedule = jobSchedules.first();
            expect(jobSchedule instanceof JobSchedule).toBe(true);
            expect(jobSchedule.id).toEqual("job-schedule-1");
            expect(jobSchedule.displayName).toEqual("JobSchedule 1");
            expect(jobSchedule.state).toEqual(JobScheduleState.disabled);
            done();
        });

        const req = httpMock.expectOne({
            url: "/jobschedules",
            method: "GET",
        });
        expect(req.request.body).toBe(null);
        req.flush({
            value: [{
                id: "job-schedule-1",
                displayName: "JobSchedule 1",
                state: "disabled",
            }],
        });
        httpMock.verify();
    });

    it("delete jobSchedule", (done) => {
        jobScheduleService.delete("job-schedule-1").subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/jobschedules/job-schedule-1",
            method: "DELETE",
        });
        expect(req.request.body).toBe(null);
        req.flush("");
        httpMock.verify();
    });

    it("patch jobSchedule", (done) => {
        const patchdto = new JobSchedulePatchDto({
            metadata: [
                { name: "abc", value: "foo" },
            ],
        });
        jobScheduleService.patch("job-schedule-1", patchdto).subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/jobschedules/job-schedule-1",
            method: "PATCH",
        });
        expect(req.request.body).toEqual({
            metadata: [
                { name: "abc", value: "foo" },
            ],
        });
        req.flush("");
        httpMock.verify();
    });

    it("disable job schedule", (done) => {
        jobScheduleService.disable("job-schedule-1").subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/jobschedules/job-schedule-1/disable",
            method: "POST",
        });
        expect(req.request.body).toBe(null);
        req.flush("");
        httpMock.verify();
    });

    it("terminate job schedule", (done) => {
        jobScheduleService.terminate("job-schedule-1").subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/jobschedules/job-schedule-1/terminate",
            method: "POST",
        });
        expect(req.request.body).toBe(null);
        req.flush("");
        httpMock.verify();
    });

});
