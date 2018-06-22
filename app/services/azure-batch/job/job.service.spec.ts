import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Job, JobState } from "app/models";
import { JobPatchDto } from "app/models/dtos";
import { JobService } from "./job.service";

describe("JobService", () => {
    let jobService: JobService;
    let httpMock: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
            ],
            providers: [
                JobService,
            ],
        });
        jobService = new JobService(TestBed.get(HttpClient));
        httpMock = TestBed.get(HttpTestingController);
    });

    it("get a job", (done) => {
        jobService.get("job-1").subscribe((job: Job) => {
            expect(job instanceof Job).toBe(true);
            expect(job.id).toEqual("job-1");
            expect(job.displayName).toEqual("Job 1");
            expect(job.state).toEqual(JobState.disabled);
            done();
        });

        const req = httpMock.expectOne({
            url: "/jobs/job-1",
            method: "GET",
        });
        expect(req.request.body).toBe(null);
        req.flush({
            id: "job-1",
            displayName: "Job 1",
            state: "disabled",
        });
        httpMock.verify();
    });

    it("list job", (done) => {
        jobService.list().subscribe((response) => {
            const jobs = response.items;
            expect(jobs.size).toBe(1);
            const job = jobs.first();
            expect(job instanceof Job).toBe(true);
            expect(job.id).toEqual("job-1");
            expect(job.displayName).toEqual("Job 1");
            expect(job.state).toEqual(JobState.disabled);
            done();
        });

        const req = httpMock.expectOne({
            url: "/jobs",
            method: "GET",
        });
        expect(req.request.body).toBe(null);
        req.flush({
            value: [{
                id: "job-1",
                displayName: "Job 1",
                state: "disabled",
            }],
        });
        httpMock.verify();
    });

    it("delete job", (done) => {
        jobService.delete("job-1").subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/jobs/job-1",
            method: "DELETE",
        });
        expect(req.request.body).toBe(null);
        req.flush("");
        httpMock.verify();
    });

    it("patch job", (done) => {
        const patchdto = new JobPatchDto({
            metadata: [
                { name: "abc", value: "foo" },
            ],
        });
        jobService.patch("job-1", patchdto).subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/jobs/job-1",
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

    it("disable job", (done) => {
        jobService.disable("job-1", "terminate").subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/jobs/job-1/disable",
            method: "POST",
        });
        expect(req.request.body).toEqual({
            disableTasks: "terminate",
        });
        req.flush("");
        httpMock.verify();
    });

    it("enable job", (done) => {
        jobService.enable("job-1").subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/jobs/job-1/enable",
            method: "POST",
        });
        expect(req.request.body).toBe(null);
        req.flush("");
        httpMock.verify();
    });

    it("terminate job", (done) => {
        jobService.terminate("job-1").subscribe((res) => {
            done();
        });
        const req = httpMock.expectOne({
            url: "/jobs/job-1/terminate",
            method: "POST",
        });
        expect(req.request.body).toBe(null);
        req.flush("");
        httpMock.verify();
    });

});
