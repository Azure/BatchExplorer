import { HttpErrorResponse, HttpHeaders } from "@angular/common/http";
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

    describe("when creating from an ARM error", () => {
        it("assigns all attributes", () => {
            const error = ServerError.fromARM(new HttpErrorResponse({
                status: 409,
                error: {
                    code: "AlreadyExists",
                    message: "This is an error message",
                },
                headers: new HttpHeaders({
                    "x-ms-request-id": "abc-def",
                    "Date": date.toISOString(),
                }),
            }));
            expect(error.status).toEqual(409);
            expect(error.code).toEqual("AlreadyExists");
            expect(error.message).toEqual("This is an error message");
            expect(error.requestId).toEqual("abc-def");
            expect(error.timestamp).toEqual(date);
        });

        it("assigns all attributes from response with nested error", () => {
            const error = ServerError.fromARM(new HttpErrorResponse({
                status: 409,
                error: {
                    error: {
                        code: "AlreadyExists",
                        message: "This is an error message",
                    },
                },
                headers: new HttpHeaders({
                    "x-ms-request-id": "abc-def",
                    "Date": date.toISOString(),
                }),
            }));
            expect(error.status).toEqual(409);
            expect(error.code).toEqual("AlreadyExists");
            expect(error.message).toEqual("This is an error message");
            expect(error.requestId).toEqual("abc-def");
            expect(error.timestamp).toEqual(date);
        });

        it("assign default values when error and headers are missing", () => {
            const error = ServerError.fromARM(new HttpErrorResponse({
                status: 409,
                error: {},
                headers: new HttpHeaders(),
            }));
            expect(error.status).toEqual(409);
            expect(error.code).toBeUndefined();
            expect(error.message).toEqual("");
            expect(error.requestId).toBeNull();
            expect(error.timestamp).toBeNull();
        });

        it("assigns handles null error object gracefully", () => {
            const error = ServerError.fromARM(new HttpErrorResponse({
                status: 409,
                error: null,
                headers: new HttpHeaders({
                    "x-ms-request-id": "abc-def",
                    "Date": date.toISOString(),
                }),
            }));
            expect(error.status).toEqual(409);
            expect(error.code).toBeUndefined();
            expect(error.message).toEqual("");
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
