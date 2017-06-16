import { ListProxy } from "../../../src/client/api/batch-client-proxy/shared/list-proxy";

describe("ListProxy", () => {
    let listProxy;

    describe("#fetchNext()", () => {
        let entitySpy;

        beforeEach(() => {

            entitySpy = {
                list: jasmine.createSpy("list").and.callFake((options, callback) => {
                    const result: any = [1, 2, 3];
                    result.odatanextLink = "next-link";
                    callback(null, result);
                }),
                listNext: jasmine.createSpy("list-next").and.callFake((options, callback) => {
                    const result: any = [4, 5];
                    result.odatanextLink = null;
                    callback(null, result);
                }),
            };

            listProxy = new ListProxy(entitySpy, null, {});
        });

        it("should call list for the first time", () => {
            listProxy.fetchNext();
            expect(entitySpy.list).toHaveBeenCalledTimes(1);
            expect(entitySpy.listNext).not.toHaveBeenCalled();
        });

        it("should call listnExt for the second time", (done) => {
            listProxy.fetchNext().then(() => {
                expect(entitySpy.list).toHaveBeenCalledTimes(1);
            }).then(() => {
                return listProxy.fetchNext();
            }).then(() => {
                expect(entitySpy.listNext).toHaveBeenCalledTimes(1);
                done();
            });
        });
    });
});
