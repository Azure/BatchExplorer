import { Headers, Response, ResponseOptions } from "@angular/http";
import { ServerError } from "./server-error";

const date = new Date(2017, 9, 13, 23, 43, 38);

describe("ServerError.model", () => {
    describe("when creating from a batch error", () => {
        it("assign all attributes", () => {
            const error = ServerError.fromBatch({
                statusCode: 409,
                code: "AlreadyExists",
                message: {
                    value: `This is an error message\nRequestId:abc-def\nTime:${date.toISOString()}`,
                },
                body: {
                    values: [
                        { key: "SomeKey", value: "SomeValue" },
                    ],
                },
            });
            expect(error.status).toEqual(409);
            expect(error.code).toEqual("AlreadyExists");
            expect(error.message).toEqual("This is an error message");
            expect(error.requestId).toEqual("abc-def");
            expect(error.timestamp).toEqual(date);
            expect(error.details).toEqual([
                { key: "SomeKey", value: "SomeValue" },
            ]);
        });
    });

    describe("when creating from a arm error", () => {
        it("assign all attributes", () => {
            const error = ServerError.fromARM(new Response(new ResponseOptions({
                status: 409,
                body: {
                    error: {
                        code: "AlreadyExists",
                        message: "This is an error message",
                    },
                },
                headers: new Headers({
                    "x-ms-request-id": "abc-def",
                    "Date": date.toISOString(),
                }),
            })));
            expect(error.status).toEqual(409);
            expect(error.code).toEqual("AlreadyExists");
            expect(error.message).toEqual("This is an error message");
            expect(error.requestId).toEqual("abc-def");
            expect(error.timestamp).toEqual(date);
        });
    });

    describe("when creating from a storage error", () => {
        it("assign all attributes", () => {
            const error = ServerError.fromStorage({
                statusCode: 409,
                code: "AlreadyExists",
                message: `This is an error message\nRequestId:abc-def\nTime:${date.toISOString()}`,
                requestId: "abc-def",
            });
            expect(error.status).toEqual(409);
            expect(error.code).toEqual("AlreadyExists");
            expect(error.message).toEqual("This is an error message");
            expect(error.requestId).toEqual("abc-def");
            expect(error.timestamp).toEqual(date);
        });
    });

});
