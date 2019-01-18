import { BehaviorSubject, Observable, Subject } from "rxjs";
import { wrapMainObservable } from "./electron-utils";

describe("ElectronUtils", () => {
    describe("warpMainObservable", () => {
        let subject: Subject<number>;
        let obs: Observable<number>;
        let beforeunloadCallbacks: Array<() => void>;
        let zoneSpy;

        beforeEach(() => {
            zoneSpy = {
                run: jasmine.createSpy("zone.run"),
            };
            beforeunloadCallbacks = [];
            subject = new BehaviorSubject(0);
            obs = wrapMainObservable(subject, zoneSpy);

            spyOn(window, "addEventListener").and.callFake((name, callback) => {
                expect(name).toEqual("beforeunload");
                beforeunloadCallbacks.push(callback);
            });
        });

        afterEach(() => {
            subject.complete();
        });

        it("Subscribe correctly", () => {
            const spy1 = jasmine.createSpy("spy1");
            const spy2 = jasmine.createSpy("spy2");
            const sub1 = obs.subscribe(spy1);

            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy1).toHaveBeenCalledWith(0);

            subject.next(1);
            expect(spy1).toHaveBeenCalledTimes(2);
            expect(spy1).toHaveBeenCalledWith(1);

            const sub2 = obs.subscribe(spy2);

            expect(spy1).toHaveBeenCalledTimes(2);
            expect(spy2).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenCalledWith(1);

            expect(sub1.closed).toBe(false);
            expect(sub2.closed).toBe(false);

            subject.complete();
            expect(sub1.closed).toBe(true);
            expect(sub2.closed).toBe(true);
        });

        it("close the subscription when the main subject complete", () => {
            const spy1 = jasmine.createSpy("spy1");
            const spy2 = jasmine.createSpy("spy2");

            const sub1 = obs.subscribe(spy1);
            const sub2 = obs.subscribe(spy2);

            expect(sub1.closed).toBe(false);
            expect(sub2.closed).toBe(false);

            subject.complete();
            expect(sub1.closed).toBe(true);
            expect(sub2.closed).toBe(true);
        });

        it("close the subscription when the window is closing", () => {
            const spy1 = jasmine.createSpy("spy1");
            const spy2 = jasmine.createSpy("spy2");

            obs.subscribe(spy1);
            expect(window.addEventListener).toHaveBeenCalledTimes(1);
            expect(window.addEventListener).toHaveBeenCalledWith("beforeunload",
                jasmine.anything(), undefined);
            obs.subscribe(spy2);
            // Doesn't call it again
            expect(window.addEventListener).toHaveBeenCalledTimes(1);

            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenCalledTimes(1);
            beforeunloadCallbacks.forEach(x => x());

            subject.next(1);
            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenCalledTimes(1);

            expect(spy1).not.toHaveBeenCalledWith(1);
            expect(spy2).not.toHaveBeenCalledWith(1);
        });

        it("doesn't share the last value when original is a subject", () => {
            subject.complete();
            subject = new Subject();
            obs = wrapMainObservable(subject, zoneSpy);

            const spy1 = jasmine.createSpy("spy1");
            const spy2 = jasmine.createSpy("spy2");
            obs.subscribe(spy1);

            expect(spy1).toHaveBeenCalledTimes(0);

            subject.next(1);
            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy1).toHaveBeenCalledWith(1);

            obs.subscribe(spy2);

            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenCalledTimes(0);

        });
    });
});
