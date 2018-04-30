import {
    fakeAsync,
    tick,
} from "@angular/core/testing";

import { List } from "immutable";
import { BehaviorSubject, Subject } from "rxjs";

import { BackgroundTask, BackgroundTaskService } from "@batch-flask/ui/background-task";
import { NotificationServiceMock } from "test/utils/mocks";

fdescribe("BackgroundTaskService ", () => {
    let taskManager: BackgroundTaskService;
    let runningTasks: List<BackgroundTask>;
    let notificationServiceSpy: NotificationServiceMock;
    beforeEach(() => {
        notificationServiceSpy = new NotificationServiceMock();
        taskManager = new BackgroundTaskService(notificationServiceSpy as any);
        taskManager.runningTasks.subscribe((tasks) => {
            runningTasks = tasks;
        });
    });

    it("Should start and complete a simple task with no progress", fakeAsync(() => {
        const obs = new Subject();
        const spy = jasmine.createSpy("Task spy").and.returnValue(obs);
        taskManager.startTask("task1", spy);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(runningTasks.size).toBe(1);
        const task = runningTasks.first();
        let name;
        const doneSpy = jasmine.createSpy();
        task.name.subscribe(x => name = x);
        task.done.subscribe(doneSpy);

        expect(name).toEqual("task1");
        expect(task.progress.getValue()).toBe(-1, "Progress should start at -1(Indeterminate time)");
        expect(doneSpy).toHaveBeenCalledOnce("Task should not yet be completed");

        obs.complete();
        expect(done).toBe(true, "Task should now be marked as completed");

        // Should only get removed after a few seconds
        tick(BackgroundTask.completeDelay);
        expect(runningTasks.size).toBe(0);
    }));

    it("Should update the progress of the task", () => {
        const obs = new Subject();
        let progress: BehaviorSubject<number>;
        taskManager.startTask("task1", (task) => {
            task.progress.next(0);
            progress = task.progress;
            return obs;
        });

        expect(runningTasks.size).toBe(1);
        const task = runningTasks.first();
        expect(task.progress.getValue()).toBe(0, "Progress should have been set to 0");

        progress.next(50);
        expect(task.progress.getValue()).toBe(50, "Progress should have been set to 0");
    });

    it("Group task should run tasks 1 by 1", () => {
        const obs = {
            task1: new Subject(),
            task2: new Subject(),
        };
        const spies = {
            task1: jasmine.createSpy("Task spy1").and.returnValue(obs.task1),
            task2: jasmine.createSpy("Task spy2").and.returnValue(obs.task2),
        };

        taskManager.startTasks("Job", [
            { name: "Task1", func: spies.task1 },
            { name: "Task2", func: spies.task2 },
        ]);

        expect(spies.task1).toHaveBeenCalledTimes(1);
        expect(spies.task2).not.toHaveBeenCalled();

        expect(runningTasks.size).toBe(1);
        const task = runningTasks.first();
        let name;
        let done = false;
        task.name.subscribe(x => name = x);
        task.done.subscribe(x => done = x);
        expect(name).toEqual("Job (1/2)");
        expect(done).toBe(false);

        obs.task1.complete();
        expect(name).toEqual("Job (2/2)");
        expect(spies.task1).toHaveBeenCalledTimes(1);
        expect(spies.task2).toHaveBeenCalledTimes(1);

        obs.task2.complete();
        expect(done).toBe(true);
    });
});
