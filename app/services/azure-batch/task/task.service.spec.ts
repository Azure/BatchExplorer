import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Task, TaskState } from "app/models";
import { TaskService } from "./task.service";

fdescribe("TaskService", () => {
    let taskService: TaskService;
    let httpMock: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
            ],
            providers: [
                TaskService,
            ],
        });
        taskService = new TaskService(TestBed.get(HttpClient));
        httpMock = TestBed.get(HttpTestingController);
    });

    it("get a task", (done) => {
        taskService.get("job-1", "task-2").subscribe((task: Task) => {
            expect(task instanceof Task).toBe(true);
            expect(task.id).toEqual("task-2");
            expect(task.state).toEqual(TaskState.running);
            done();
        });

        const req = httpMock.expectOne({
            url: "/jobs/job-1/tasks/task-2",
            method: "GET",
        });
        expect(req.request.body).toBe(null);
        req.flush({
            id: "task-2",
            state: "running",
        });
        httpMock.verify();
    });

    it("list job", (done) => {
        taskService.list("job-1").subscribe((response) => {
            const tasks = response.items;
            expect(tasks.size).toBe(1);
            const task = tasks.first();
            expect(task instanceof Task).toBe(true);
            expect(task.id).toEqual("task-2");
            expect(task.state).toEqual(TaskState.running);
            done();
        });

        const req = httpMock.expectOne({
            url: "/jobs/job-1/tasks",
            method: "GET",
        });
        expect(req.request.body).toBe(null);
        req.flush({
            value: [{
                id: "task-2",
                state: "running",
            }],
        });
        httpMock.verify();
    });

    it("delete a task", (done) => {
        taskService.delete("job-1", "task-2").subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/jobs/job-1/tasks/task-2",
            method: "DELETE",
        });
        expect(req.request.body).toBe(null);
        req.flush("");
        httpMock.verify();
    });

    it("terminate a task", (done) => {
        taskService.terminate("job-1", "task-2").subscribe((res) => {
            done();
        });

        const req = httpMock.expectOne({
            url: "/jobs/job-1/tasks/task-2/terminate",
            method: "POST",
        });
        expect(req.request.body).toBe(null);
        req.flush("");
        httpMock.verify();
    });
});
