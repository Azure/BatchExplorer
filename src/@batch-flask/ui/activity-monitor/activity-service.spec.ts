import { fakeAsync } from "@angular/core/testing";
import { Activity, ActivityService } from "@batch-flask/ui/activity-monitor";
import { AsyncSubject, of } from "rxjs";
import { NotificationServiceMock } from "test/utils/mocks";

describe("ActivityService ", () => {
    let activityService: ActivityService;
    let runningActivities: Activity[];
    let notificationServiceSpy: NotificationServiceMock;
    beforeEach(() => {
        notificationServiceSpy = new NotificationServiceMock();
        activityService = new ActivityService(notificationServiceSpy as any);
        activityService.incompleteSnapshots.subscribe((snapshots) => {
            runningActivities = snapshots.map(snapshot => snapshot.activity);
        });
    });

    // TODO implement new tests for the service
    // (these are copied over from the background-task-service.spec)

    it("Should start and complete a simple activity", fakeAsync(() => {
        const subject = new AsyncSubject();
        const initializerSpy = jasmine.createSpy("Initializer spy").and.returnValue(subject);
        const activity = new Activity("Spy on service", initializerSpy);
        activityService.loadAndRun(activity);

        expect(initializerSpy).toHaveBeenCalledTimes(1);
        expect(runningActivities.length).toBe(1);

        const doneSpy = jasmine.createSpy("Task is completed");
        activity.done.subscribe(doneSpy);

        // activity not yet completed while subject has not emitted
        expect(doneSpy).not.toHaveBeenCalled();

        // complete the subject and expect to call doneSpy
        subject.next(null);
        subject.complete();
        expect(doneSpy).toHaveBeenCalledOnce();
    }));

    it("Should update the progress of an activity with subactivities", () => {
        let progress: number;
        const subj1 = new AsyncSubject();
        const subj2 = new AsyncSubject();

        const initializer = () => {
            return of([new Activity("subtask1", () => subj1), new Activity("subtask2", () => subj2)]);
        };
        const activity = new Activity("task1", initializer);
        activityService.loadAndRun(activity);

        expect(runningActivities.length).toBe(1);

        // subscribe to the activity progress
        activity.progress.subscribe(prog => {
            progress = prog;
        });

        expect(progress).toBe(0, "Progress should initially be set to 0");

        // complete subject1 and expect half the activity to be done
        subj1.next(null);
        subj1.complete();

        expect(progress).toBe(50, "Progress should advance to 50% when half of the subactivities complete");

        // complete subject2 and expect the full activity to be done
        subj2.next(null);
        subj2.complete();

        expect(progress).toBe(100, "Progress should advance to completion when all subtasks are complete");
    });
});
