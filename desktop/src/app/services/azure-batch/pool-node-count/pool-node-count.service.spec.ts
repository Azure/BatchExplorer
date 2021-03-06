import { fakeAsync, tick } from "@angular/core/testing";
import { BehaviorSubject, of, throwError } from "rxjs";
import { PoolNodeCountService } from "./pool-node-count.service";

const mockResponse = [
    {
        poolId: "pool1",
        dedicated: {
            creating: 0,
            idle: 0,
            leavingpool: 0,
            offline: 0,
            preempted: 0,
            rebooting: 0,
            reimaging: 0,
            running: 0,
            starting: 0,
            startTaskFailed: 0,
            unknown: 0,
            unusable: 0,
            waitingForStartTask: 0,
            total: 0,
        },
        lowPriority: {
            creating: 0,
            idle: 0,
            leavingpool: 0,
            offline: 0,
            preempted: 0,
            rebooting: 0,
            reimaging: 0,
            running: 2,
            starting: 1,
            startTaskFailed: 0,
            unknown: 0,
            unusable: 0,
            waitingForStartTask: 0,
            total: 3,
        },
    },
    {
        poolId: "pool2",
        dedicated: {
            creating: 0,
            idle: 1,
            leavingpool: 0,
            offline: 3,
            preempted: 0,
            rebooting: 0,
            reimaging: 0,
            running: 0,
            starting: 0,
            startTaskFailed: 0,
            unknown: 0,
            unusable: 0,
            waitingForStartTask: 0,
            total: 4,
        },
        lowPriority: {
            creating: 0,
            idle: 0,
            leavingpool: 0,
            offline: 0,
            preempted: 0,
            rebooting: 0,
            reimaging: 0,
            running: 0,
            starting: 0,
            startTaskFailed: 0,
            unknown: 0,
            unusable: 0,
            waitingForStartTask: 0,
            total: 0,
        },
    },
    {
        poolId: "pool3",
        dedicated: {
            creating: 0,
            idle: 5,
            leavingpool: 0,
            offline: 0,
            preempted: 0,
            rebooting: 0,
            reimaging: 4,
            running: 0,
            starting: 0,
            startTaskFailed: 0,
            unknown: 0,
            unusable: 0,
            waitingForStartTask: 0,
            total: 9,
        },
        lowPriority: {
            creating: 7,
            idle: 0,
            leavingpool: 0,
            offline: 0,
            preempted: 0,
            rebooting: 0,
            reimaging: 0,
            running: 4,
            starting: 0,
            startTaskFailed: 0,
            unknown: 0,
            unusable: 0,
            waitingForStartTask: 0,
            total: 11,
        },
    },
];

describe("PoolNodeCountService", () => {
    let service: PoolNodeCountService;
    let accountServiceSpy;
    let httpSpy;
    let fakeOffline: boolean;

    beforeEach(() => {
        fakeOffline = false;

        accountServiceSpy = {
            currentAccountId: new BehaviorSubject("acc-1"),
        };
        httpSpy = {
            get: jasmine.createSpy("http.get").and.callFake(() => {
                if (fakeOffline) {
                    return throwError("offline");
                }
                return of({ value: mockResponse });
            }),
        };
        service = new PoolNodeCountService(accountServiceSpy, httpSpy);
    });

    afterEach(() => {
        service.ngOnDestroy();
    });

    it("Loads the counts when asked to refresh", (done) => {
        expect(httpSpy.get).toHaveBeenCalledTimes(0);
        service.refresh().subscribe((counts) => {
            expect(httpSpy.get).toHaveBeenCalledTimes(1);
            expect(counts).not.toBeNull();
            expect(counts.size).toBe(3);
            const pool3Counts = counts.get("pool3");
            expect(pool3Counts).not.toBeFalsy();
            expect(pool3Counts.total).toEqual(20);
            expect(pool3Counts.dedicated.total).toEqual(9);
            expect(pool3Counts.lowPriority.total).toEqual(11);
            expect(pool3Counts.dedicated.idle).toEqual(5);
            expect(pool3Counts.lowPriority.idle).toEqual(0);
            done();
        });
    });

    it("Refresh the node counts every 30 seconds when subscribing to it", fakeAsync(() => {
        service.ngOnDestroy();
        service = new PoolNodeCountService(accountServiceSpy, httpSpy);

        expect(httpSpy.get).toHaveBeenCalledTimes(0);
        const sub = service.counts.subscribe();
        tick();
        expect(httpSpy.get).toHaveBeenCalledTimes(1);
        tick(30000);
        expect(httpSpy.get).toHaveBeenCalledTimes(2);
        tick(30000);
        expect(httpSpy.get).toHaveBeenCalledTimes(3);

        sub.unsubscribe();
        tick(30000);
        expect(httpSpy.get).toHaveBeenCalledTimes(3); // Not called anymore as no more subs
    }));

    it("recover from error when auto polling", fakeAsync(() => {
        service.ngOnDestroy();
        service = new PoolNodeCountService(accountServiceSpy, httpSpy);

        expect(httpSpy.get).toHaveBeenCalledTimes(0);
        let counts;
        const sub = service.counts.subscribe(x => counts = x);
        tick();
        expect(httpSpy.get).toHaveBeenCalledTimes(1);
        expect(counts).not.toBeNull();
        expect(counts.size).toBe(3);

        // -------------------------- Fake offline while fetching --------------------
        fakeOffline = true;
        tick(30000);
        expect(httpSpy.get).toHaveBeenCalledTimes(2);
        // Keep the last results
        expect(counts).not.toBeNull();
        expect(counts.size).toBe(3);

        // -------------------------- Back online ------------------------------------
        fakeOffline = false;
        counts = null;
        tick(30000);
        expect(httpSpy.get).toHaveBeenCalledTimes(3);

        expect(counts).not.toBeNull();
        expect(counts.size).toBe(3);
        sub.unsubscribe();
    }));

    it("Don't double refresh when subscribing multiple times to count", fakeAsync(() => {
        service.ngOnDestroy();
        service = new PoolNodeCountService(accountServiceSpy, httpSpy);

        expect(httpSpy.get).toHaveBeenCalledTimes(0);
        const sub1 = service.counts.subscribe();
        const sub2 = service.counts.subscribe();
        tick();
        expect(httpSpy.get).toHaveBeenCalledTimes(1);
        tick(30000);
        expect(httpSpy.get).toHaveBeenCalledTimes(2);
        tick(30000);
        expect(httpSpy.get).toHaveBeenCalledTimes(3);

        sub1.unsubscribe();
        tick(30000);
        expect(httpSpy.get).toHaveBeenCalledTimes(4);
        sub2.unsubscribe();
        tick(30000);
        expect(httpSpy.get).toHaveBeenCalledTimes(4); // Not called anymore as no more subs
    }));

    it("Refresh when the account id changes", fakeAsync(() => {
        const sub = service.counts.subscribe();
        tick();
        expect(httpSpy.get).toHaveBeenCalledTimes(1);
        accountServiceSpy.currentAccountId.next("acc-2");
        expect(httpSpy.get).toHaveBeenCalledTimes(2);
        sub.unsubscribe();
    }));
});
