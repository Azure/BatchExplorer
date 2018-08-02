import { fakeAsync, tick } from "@angular/core/testing";

import { PollObservable, PollService } from "@batch-flask/core";
import { timer } from "rxjs";

describe("PollService", () => {
    let service: PollService;
    let poll1: PollObservable;
    let poll1Spy: jasmine.Spy;
    let poll2: PollObservable;
    let poll2Spy: jasmine.Spy;

    beforeEach(() => {
        service = new PollService();
        poll1Spy = jasmine.createSpy("Poll-1");
        poll2Spy = jasmine.createSpy("Poll-2");
    });

    it("should start a poll", fakeAsync(() => {
        poll1 = service.startPoll("key-1", 1000, poll1Spy);

        expect(poll1Spy).toHaveBeenCalledTimes(0);
        tick(1000);
        expect(poll1Spy).toHaveBeenCalledTimes(1);
        tick(2000);
        expect(poll1Spy).toHaveBeenCalledTimes(3);
        poll1.destroy();
        tick(2000);
        expect(poll1Spy).toHaveBeenCalledTimes(3);
    }));

    it("should wait for callback observable to complete if applicable", fakeAsync(() => {
        poll1 = service.startPoll("key-1", 1000, () => {
            poll1Spy();
            return timer(1000);
        });

        expect(poll1Spy).toHaveBeenCalledTimes(0); // Not yet called
        tick(1000);
        expect(poll1Spy).toHaveBeenCalledTimes(1); // Called after first interval
        tick(1500);
        expect(poll1Spy).toHaveBeenCalledTimes(1); // Needs to wait 1000ms for observable to return so no more call
        tick(500);
        expect(poll1Spy).toHaveBeenCalledTimes(2);
        tick(2000);
        expect(poll1Spy).toHaveBeenCalledTimes(3); // After 1000ms(observable) + 1000ms(interval) triggers again
        poll1.destroy();
        tick(2000);
        expect(poll1Spy).toHaveBeenCalledTimes(3);
    }));

    it("starting a poll with a long timer should not active it", fakeAsync(() => {
        poll1 = service.startPoll("key-1", 1000, poll1Spy);

        poll2 = service.startPoll("key-1", 2000, poll2Spy);
        tick(4000);
        expect(poll2Spy).not.toHaveBeenCalled();
        expect(poll1Spy).toHaveBeenCalledTimes(4);

        poll1.destroy();
        tick(4000);
        expect(poll2Spy).toHaveBeenCalledTimes(2);
        expect(poll1Spy).toHaveBeenCalledTimes(4);
        poll2.destroy();
    }));

    it("starting a poll with a smaller timer should active it", fakeAsync(() => {
        poll1 = service.startPoll("key-1", 1000, poll1Spy);

        poll2 = service.startPoll("key-1", 500, poll2Spy);
        tick(4000);
        expect(poll2Spy).toHaveBeenCalledTimes(8);
        expect(poll1Spy).not.toHaveBeenCalled();

        poll1.destroy();
        tick(4000);
        expect(poll2Spy).toHaveBeenCalledTimes(16);
        expect(poll1Spy).not.toHaveBeenCalled();
        poll2.destroy();
    }));

    it("starting a poll with a different key should also start it", fakeAsync(() => {
        poll1 = service.startPoll("key-1", 1000, poll1Spy);

        poll2 = service.startPoll("key-2", 2000, poll2Spy);
        tick(4000);
        expect(poll1Spy).toHaveBeenCalledTimes(4);
        expect(poll2Spy).toHaveBeenCalledTimes(2);

        poll1.destroy();
        tick(4000);
        expect(poll1Spy).toHaveBeenCalledTimes(4);
        expect(poll2Spy).toHaveBeenCalledTimes(4);
        poll2.destroy();
    }));

    it("update key of a poll and replace with better timer", fakeAsync(() => {
        poll1 = service.startPoll("key-1", 1000, poll1Spy);

        poll2 = service.startPoll("key-2", 500, poll2Spy);
        tick(2000);
        expect(poll1Spy).toHaveBeenCalledTimes(2);
        expect(poll2Spy).toHaveBeenCalledTimes(4);
        poll2.updateKey("key-1");
        tick(2000);
        expect(poll1Spy).toHaveBeenCalledTimes(2); // SHould not call first one anymore
        expect(poll2Spy).toHaveBeenCalledTimes(8);
        poll1.destroy();
        poll2.destroy();
    }));

    it("update key of a poll should free other larger timer", fakeAsync(() => {
        poll1 = service.startPoll("key-1", 1000, poll1Spy);

        poll2 = service.startPoll("key-1", 500, poll2Spy);
        tick(2000);
        expect(poll1Spy).toHaveBeenCalledTimes(0);
        expect(poll2Spy).toHaveBeenCalledTimes(4);
        poll2.updateKey("key-2");
        tick(2000);
        expect(poll1Spy).toHaveBeenCalledTimes(2); // SHould not call first one anymore
        expect(poll2Spy).toHaveBeenCalledTimes(8);
        poll1.destroy();
        poll2.destroy();
    }));
});
