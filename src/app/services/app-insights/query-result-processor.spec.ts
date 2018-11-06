import { AppInsightsMetricBody } from "app/models";
import { AppInsightQueryResultProcessor } from "./query-result-processor";

describe("QueryResultProcessor", () => {
    it("Map a simple result without grouping", () => {
        const processor = new AppInsightQueryResultProcessor({
            appInsightsMetricId: "myMetric",
        });
        const body: AppInsightsMetricBody = {
            start: null,
            end: null,
            interval: null,
            segments: [
                {
                    start: new Date(2018, 3, 14, 10, 10).toString(),
                    end: new Date(2018, 3, 14, 10, 12).toString(),
                    myMetric: {
                        avg: 2,
                    },
                },
                {
                    start: new Date(2018, 3, 14, 10, 12).toString(),
                    end: new Date(2018, 3, 14, 10, 14).toString(),
                    myMetric: {
                        avg: 3,
                    },
                },
                {
                    start: new Date(2018, 3, 14, 10, 14).toString(),
                    end: new Date(2018, 3, 14, 10, 16).toString(),
                    myMetric: {
                        avg: 5,
                    },
                },
            ],
        };

        const result = processor.process(body);

        expect(result).toEqual([
            {
                time: new Date(2018, 3, 14, 10, 11),
                value: 2,
            },
            {
                time: new Date(2018, 3, 14, 10, 13),
                value: 3,
            },
            {
                time: new Date(2018, 3, 14, 10, 15),
                value: 5,
            },
        ]);
    });

    it("Map a grouped result", () => {
        const processor = new AppInsightQueryResultProcessor({
            appInsightsMetricId: "myMetric",
            segment: "nodeId",
        });
        const body: AppInsightsMetricBody = {
            start: null,
            end: null,
            interval: null,
            segments: [
                {
                    start: new Date(2018, 3, 14, 10, 10).toString(),
                    end: new Date(2018, 3, 14, 10, 12).toString(),
                    segments: [
                        {
                            nodeId: "node-1",
                            myMetric: {
                                avg: 2,
                            },
                        },
                        {
                            nodeId: "node-2",
                            myMetric: {
                                avg: 3,
                            },
                        },
                    ],
                },
                {
                    start: new Date(2018, 3, 14, 10, 12).toString(),
                    end: new Date(2018, 3, 14, 10, 14).toString(),
                    segments: [
                        {
                            nodeId: "node-1",
                            myMetric: {
                                avg: 5,
                            },
                        },
                        {
                            nodeId: "node-2",
                            myMetric: {
                                avg: 6,
                            },
                        },
                    ],
                },
                {
                    start: new Date(2018, 3, 14, 10, 14).toString(),
                    end: new Date(2018, 3, 14, 10, 16).toString(),
                    segments: [
                        {
                            nodeId: "node-1",
                            myMetric: {
                                avg: 10,
                            },
                        },
                        {
                            nodeId: "node-2",
                            myMetric: {
                                avg: 35,
                            },
                        },
                    ],
                },
            ],
        };

        const result = processor.process(body);

        expect(result).toEqual({
            "node-1": [
                {
                    time: new Date(2018, 3, 14, 10, 11),
                    value: 2,
                },
                {
                    time: new Date(2018, 3, 14, 10, 13),
                    value: 5,
                },
                {
                    time: new Date(2018, 3, 14, 10, 15),
                    value: 10,
                },
            ],
            "node-2": [
                {
                    time: new Date(2018, 3, 14, 10, 11),
                    value: 3,
                },
                {
                    time: new Date(2018, 3, 14, 10, 13),
                    value: 6,
                },
                {
                    time: new Date(2018, 3, 14, 10, 15),
                    value: 35,
                },
            ],
        });
    });

    it("Map a multi grouped result", () => {
        const processor = new AppInsightQueryResultProcessor({
            appInsightsMetricId: "myMetric",
            segment: "disk,nodeId",
        });
        const body: AppInsightsMetricBody = {
            start: null,
            end: null,
            interval: null,
            segments: [
                {
                    start: new Date(2018, 3, 14, 10, 10).toString(),
                    end: new Date(2018, 3, 14, 10, 12).toString(),
                    segments: [
                        {
                            disk: "C:/",
                            segments: [
                                {
                                    nodeId: "node-1",
                                    myMetric: {
                                        avg: 111,
                                    },
                                },
                                {
                                    nodeId: "node-2",
                                    myMetric: {
                                        avg: 112,
                                    },
                                },
                            ],
                        },
                        {
                            disk: "D:/",
                            segments: [
                                {
                                    nodeId: "node-1",
                                    myMetric: {
                                        avg: 121,
                                    },
                                },
                                {
                                    nodeId: "node-2",
                                    myMetric: {
                                        avg: 122,
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    start: new Date(2018, 3, 14, 10, 12).toString(),
                    end: new Date(2018, 3, 14, 10, 14).toString(),
                    segments: [
                        {
                            disk: "C:/",
                            segments: [
                                {
                                    nodeId: "node-1",
                                    myMetric: {
                                        avg: 211,
                                    },
                                },
                                {
                                    nodeId: "node-2",
                                    myMetric: {
                                        avg: 212,
                                    },
                                },
                            ],
                        },
                        {
                            disk: "D:/",
                            segments: [
                                {
                                    nodeId: "node-1",
                                    myMetric: {
                                        avg: 221,
                                    },
                                },
                                {
                                    nodeId: "node-2",
                                    myMetric: {
                                        avg: 222,
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    start: new Date(2018, 3, 14, 10, 14).toString(),
                    end: new Date(2018, 3, 14, 10, 16).toString(),
                    segments: [
                        {
                            disk: "C:/",
                            segments: [
                                {
                                    nodeId: "node-1",
                                    myMetric: {
                                        avg: 311,
                                    },
                                },
                                {
                                    nodeId: "node-2",
                                    myMetric: {
                                        avg: 312,
                                    },
                                },
                            ],
                        },
                        {
                            disk: "D:/",
                            segments: [
                                {
                                    nodeId: "node-1",
                                    myMetric: {
                                        avg: 321,
                                    },
                                },
                                {
                                    nodeId: "node-2",
                                    myMetric: {
                                        avg: 322,
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const result = processor.process(body);

        expect(result).toEqual({
            "C:/": {
                "node-1": [
                    {
                        time: new Date(2018, 3, 14, 10, 11),
                        value: 111,
                    },
                    {
                        time: new Date(2018, 3, 14, 10, 13),
                        value: 211,
                    },
                    {
                        time: new Date(2018, 3, 14, 10, 15),
                        value: 311,
                    },
                ],
                "node-2": [
                    {
                        time: new Date(2018, 3, 14, 10, 11),
                        value: 112,
                    },
                    {
                        time: new Date(2018, 3, 14, 10, 13),
                        value: 212,
                    },
                    {
                        time: new Date(2018, 3, 14, 10, 15),
                        value: 312,
                    },
                ],
            },
            "D:/": {
                "node-1": [
                    {
                        time: new Date(2018, 3, 14, 10, 11),
                        value: 121,
                    },
                    {
                        time: new Date(2018, 3, 14, 10, 13),
                        value: 221,
                    },
                    {
                        time: new Date(2018, 3, 14, 10, 15),
                        value: 321,
                    },
                ],
                "node-2": [
                    {
                        time: new Date(2018, 3, 14, 10, 11),
                        value: 122,
                    },
                    {
                        time: new Date(2018, 3, 14, 10, 13),
                        value: 222,
                    },
                    {
                        time: new Date(2018, 3, 14, 10, 15),
                        value: 322,
                    },
                ],
            },
        });

    });
});
