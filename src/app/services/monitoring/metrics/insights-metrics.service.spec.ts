import { Subscription, of } from "rxjs";
import * as Fixtures from "test/fixture";

import { InsightsMetricsService } from "./insights-metrics.service";
import { MonitorChartTimeFrame } from "./monitor-metrics-base";

describe("InsightsMetricsService", () => {
    let monitorService: InsightsMetricsService;
    let requestUrl;
    let accountServiceSpy;
    let armServiceSpy;
    let mockeResponse;
    const subs: Subscription[] = [];

    beforeEach(() => {
        accountServiceSpy = {
            currentAccount: of(Fixtures.account.create({
                id: "myaccount",
            })),
        };

        armServiceSpy = {
            get: jasmine.createSpy("get").and.callFake((url, options) => {
                requestUrl = url;
                return of(mockeResponse);
            }),
        };
        monitorService = new InsightsMetricsService(accountServiceSpy, armServiceSpy);
    });

    afterEach(() => {
        monitorService = null;
        subs.forEach(sub => sub.unsubscribe());
    });

    it("should have correct resposne format", () => {
        mockeResponse = {
            value: [{
                name: {
                    value: "TaskCompleteEvent",
                    localizedValue: "Task Complete Events",
                },
                timeseries: [{
                    data: [{
                        timeStamp: "2018-01-11T19:10:00Z",
                    },
                    {
                        timeStamp: "2018-01-11T19:11:00Z",
                    },
                    {
                        timeStamp: "2018-01-11T19:12:00Z",
                    },
                    {
                        timeStamp: "2018-01-11T19:13:00Z",
                    },
                    {
                        timeStamp: "2018-01-11T19:14:00Z",
                    },
                    {
                        timeStamp: "2018-01-11T19:15:00Z",
                    },
                    {
                        timeStamp: "2018-01-11T19:16:00Z",
                    }],
                }],
            },
            {
                name: {
                    value: "TaskStartEvent",
                    localizedValue: "Task Start Events",
                },
                unit: "Count",
                timeseries: [{
                    data: [{
                        timeStamp: "2018-01-11T19:10:00Z",
                    },
                    {
                        timeStamp: "2018-01-11T19:11:00Z",
                    },
                    {
                        timeStamp: "2018-01-11T19:12:00Z",
                    }],
                }],
            }],
        };

        subs.push(monitorService.getTaskStates(MonitorChartTimeFrame.Hour).subscribe(response => {
            expect(requestUrl).toEqual("myaccount/providers/Microsoft.Insights/metrics");
            expect(response.metrics.length).toEqual(2);
            expect(response.metrics[0].name).toEqual("TaskCompleteEvent");
            expect(response.metrics[0].label).toEqual("Task complete events");
            expect(response.metrics[0].data.length).toEqual(7);
            expect(response.metrics[1].name).toEqual("TaskStartEvent");
            expect(response.metrics[1].label).toEqual("Task start events");
            expect(response.metrics[1].data.length).toEqual(3);
        }));
    });

    it("node state should have a formatted name", () => {
        mockeResponse = {
            value: [{
                name: {
                    value: "StartingNodeCount",
                    localizedValue: "Starting Node Count",
                },
                timeseries: [{
                    data: [],
                }],
            }],
        };

        subs.push(monitorService.getNodeStates(MonitorChartTimeFrame.Hour).subscribe(response => {
            expect(requestUrl).toEqual("myaccount/providers/Microsoft.Insights/metrics");
            expect(response.metrics.length).toEqual(1);
            expect(response.metrics[0].name).toEqual("StartingNodeCount");
            expect(response.metrics[0].label).toEqual("Starting");
        }));
    });
});
