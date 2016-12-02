import { ListProxy } from "../../../client/api/batch-client-proxy/shared/list-proxy";

describe("ListProxy", () => {
    let listProxy;

    describe("#fetchNext()", () => {
        let entitySpy;

        beforeEach(function () {

            entitySpy = {
                list: jasmine.createSpy("list").and.callFake((options, callback) => {
                    const result: any = [1, 2, 3];
                    result.odatanextLink = "next-link";
                    callback(null, result);
                }),
                listNext: jasmine.createSpy("list-next"),
            };

            listProxy = new ListProxy(entitySpy, null, {});
        });

        it("should call list for the first time", () => {
            listProxy.fetchNext();
            expect(entitySpy.list).toHaveBeenCalledTimes(1);
            expect(entitySpy.listNext).not.toHaveBeenCalled();
        });

        it("should call listNExt for the second time", () => {
            listProxy.fetchNext();
            listProxy.fetchNext();
            expect(entitySpy.list).toHaveBeenCalledTimes(1);
            expect(entitySpy.listNext).toHaveBeenCalledTimes(1);
        });
    });
});
