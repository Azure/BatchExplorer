import { Response, ResponseOptions } from "@angular/http";
import { Observable, Subscription } from "rxjs";
import * as Fixtures from "test/fixture";

import { InsightsMetricsService } from "./insights-metrics.service";

describe("InsightsMetricsService", () => {
    let monitorService: InsightsMetricsService;
    let requestUrl;
    let themeServiceSpy;
    let accountServiceSpy;
    let armServiceSpy;
    let mockeResponse;
    let subs: Subscription[] = [];

    beforeEach(() => {
        themeServiceSpy = {
            currentTheme: Observable.of({
                monitorChart: {},
            }),
        };

        accountServiceSpy = {
            currentAccount: Observable.of(Fixtures.account.create({
                id: "myaccount",
            })),
        };

        armServiceSpy = {
            get: jasmine.createSpy("get").and.callFake((url, options) => {
                requestUrl = url;
                return Observable.of(new Response(new ResponseOptions(mockeResponse)));
            }),
        };
        monitorService = new InsightsMetricsService(themeServiceSpy, accountServiceSpy, armServiceSpy);
    });

    afterEach(() => {
        monitorService = null;
        subs.forEach(sub => sub.unsubscribe());
    });

    it("should have correct resposne format", () => {
        mockeResponse = {
            body: JSON.stringify({
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
            }),
        };

        subs.push(monitorService.getTaskStates().subscribe(response => {
            expect(requestUrl).toEqual("myaccount/providers/Microsoft.Insights/metrics");
            expect(response.metrics.length).toEqual(2);
            expect(response.metrics[0].name.value).toEqual("TaskCompleteEvent");
            expect(response.metrics[0].name.localizedValue).toEqual("Task complete events");
            expect(response.metrics[0].data.length).toEqual(7);
            expect(response.metrics[1].name.value).toEqual("TaskStartEvent");
            expect(response.metrics[1].name.localizedValue).toEqual("Task start events");
            expect(response.metrics[1].data.length).toEqual(3);
        }));
    });

    it("node state should have a formatted name", () => {
        mockeResponse = {
            body: JSON.stringify({
                value: [{
                    name: {
                        value: "TestNodeCount",
                        localizedValue: "Test Node Count",
                    },
                    timeseries: [{
                        data: [],
                    }],
                }],
            }),
        };

        subs.push(monitorService.getNodeStates().subscribe(response => {
            expect(requestUrl).toEqual("myaccount/providers/Microsoft.Insights/metrics");
            expect(response.metrics.length).toEqual(1);
            expect(response.metrics[0].name.localizedValue).toEqual("Test");
            expect(response.metrics[0].name.value).toEqual("TestNodeCount");
        }));
    });
});
