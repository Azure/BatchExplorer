import { fakeAsync } from "@angular/core/testing";
import { Activity, ActivityService } from "@batch-flask/ui/activity";
import { ActivityResponse } from "@batch-flask/ui/activity/activity-types/activity-datatypes";
import { AsyncSubject, BehaviorSubject, of } from "rxjs";
import { NotificationServiceMock } from "test/utils/mocks";

describe("ActivityService ", () => {
    let activityService: ActivityService;
    let runningActivities: Activity[];
    let notificationServiceSpy: NotificationServiceMock;
    beforeEach(() => {
        notificationServiceSpy = new NotificationServiceMock();
        activityService = new ActivityService(notificationServiceSpy as any);
        activityService.incompleteActivities.subscribe((activities) => {
            runningActivities = activities;
        });
    });

    it("Should start and complete a simple activity", fakeAsync(() => {
        const subject = new AsyncSubject();
        const initializerSpy = jasmine.createSpy("Initializer spy").and.returnValue(subject);
        const activity = new Activity("Spy on service", initializerSpy);
        activityService.exec(activity);

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
        activityService.exec(activity);

        expect(runningActivities.length).toBe(1);

        // subscribe to the activity progress
        activity.progress.subscribe(prog => {
            progress = prog;
        });

        // subscribe to activity completion
        const doneSpy = jasmine.createSpy("Activity is done");
        activity.done.subscribe(doneSpy);

        expect(progress).toBe(0, "Progress should initially be set to 0");

        // complete subject1 and expect half the activity to be done
        subj1.next(null);
        subj1.complete();

        expect(progress).toBe(50, "Progress should advance to 50% when half of the subactivities complete");
        expect(doneSpy).not.toHaveBeenCalled();

        // complete subject2 and expect the full activity to be done
        subj2.next(null);
        subj2.complete();

        expect(progress).toBe(100, "Progress should advance to completion when all subtasks are complete");
        expect(doneSpy).toHaveBeenCalledOnce();
    });

    it("Should update the progress of a large activity that is broken into chunks", () => {
        let progress: number;
        const subj: BehaviorSubject<ActivityResponse> = new BehaviorSubject(new ActivityResponse(0));

        const initializerSpy = jasmine.createSpy("Initializer spy").and.returnValue(subj);

        const activity = new Activity("large activity", initializerSpy);
        activityService.exec(activity);

        expect(initializerSpy).toHaveBeenCalledOnce();
        expect(runningActivities.length).toBe(1);

        // subscribe to the activity progress
        activity.progress.subscribe(prog => {
            progress = prog;
        });

        // subscribe to activity completion
        const doneSpy = jasmine.createSpy("Activity is done");
        activity.done.subscribe(doneSpy);

        expect(progress).toBe(0, "Progress should initially be set to 0");

        subj.next(new ActivityResponse(49));

        expect(progress).toBe(49, "Progress should move to 49%");
        expect(doneSpy).not.toHaveBeenCalled();

        subj.next(new ActivityResponse(100));
        subj.complete();

        expect(progress).toBe(100, "Progress should move to 100% and complete");
        expect(doneSpy).toHaveBeenCalledOnce();
    });
});
