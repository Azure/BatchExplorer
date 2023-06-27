import { UserAccountElevationLevel } from "app/models/user-account";
import { TaskCreateDto } from "./task-create.dto";

describe("TaskCreateDto", () => {
    describe("userIdentity", () => {
        it("doesn't set null attributes", () => {
            const task = new TaskCreateDto({
                id: "task-identity",
                commandLine: "hostname",
                userIdentity: {
                    autoUser: {
                        elevationLevel: UserAccountElevationLevel.nonadmin,
                    },
                },
            });

            expect(task.toJS()).toEqual({
                id: "task-identity",
                commandLine: "hostname",
                userIdentity: {
                    autoUser: {
                        elevationLevel: UserAccountElevationLevel.nonadmin,
                    },
                },
            });
        });

        it("apply all attributes", () => {
            const task = new TaskCreateDto({
                id: "task-identity",
                commandLine: "hostname",
                userIdentity: {
                    autoUser: {
                        scope: "pool",
                        elevationLevel: UserAccountElevationLevel.nonadmin,
                    },
                },
            });

            expect(task.toJS()).toEqual({
                id: "task-identity",
                commandLine: "hostname",
                userIdentity: {
                    autoUser: {
                        scope: "pool",
                        elevationLevel: UserAccountElevationLevel.nonadmin,
                    },
                },
            });
        });

        it("remove unknown attributes", () => {
            const task = new TaskCreateDto({
                id: "task-identity",
                commandLine: "hostname",
                userIdentity: {
                    what: "foo",
                    autoUser: {
                        unkown: "bar",
                        elevationLevel: UserAccountElevationLevel.nonadmin,
                    },
                },
            } as any);

            expect(task.toJS()).toEqual({
                id: "task-identity",
                commandLine: "hostname",
                userIdentity: {
                    autoUser: {
                        elevationLevel: UserAccountElevationLevel.nonadmin,
                    },
                },
            });
        });
    });
});
