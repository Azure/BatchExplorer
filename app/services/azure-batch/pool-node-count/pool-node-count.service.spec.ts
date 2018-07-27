import { fakeAsync, tick } from "@angular/core/testing";
import { BehaviorSubject, of } from "rxjs";
import { PoolNodeCountService, PoolNodeCounts } from "./pool-node-count.service";

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
    let counts: Map<string, PoolNodeCounts>;
    beforeEach(() => {
        accountServiceSpy = {
            currentAccountId: new BehaviorSubject("acc-1"),
        };
        httpSpy = {
            get: jasmine.createSpy("http.get").and.returnValue(of({ value: mockResponse })),
        };
        service = new PoolNodeCountService(accountServiceSpy, httpSpy);
        service.counts.subscribe((x) => counts = x);
    });

    afterEach(() => {
        service.ngOnDestroy();
    });

    it("Loads the counts when asked to refresh", (done) => {
        expect(httpSpy.get).toHaveBeenCalledTimes(1);
        counts = null;
        service.refresh().subscribe(() => {
            expect(httpSpy.get).toHaveBeenCalledTimes(2);
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

    xit("Refresh the node counts every 30 seconds", fakeAsync(() => {
        expect(httpSpy.get).toHaveBeenCalledTimes(1);
        tick(30000);
        expect(httpSpy.get).toHaveBeenCalledTimes(2);
        tick(30000);
        expect(httpSpy.get).toHaveBeenCalledTimes(3);
    }));

    it("Refresh when the account id changes", () => {
        expect(httpSpy.get).toHaveBeenCalledTimes(1);
        accountServiceSpy.currentAccountId.next("acc-2");
        expect(httpSpy.get).toHaveBeenCalledTimes(2);
    });
});
