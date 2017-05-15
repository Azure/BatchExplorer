import { AutoUserScope, StartTask, UserAccountElevationLevel } from "app/models";
import { DecoratorBase } from "app/utils/decorators";


export class StartTaskDecorator extends DecoratorBase<StartTask> {
    public userIdentitySummary: string;

    constructor(startTask: StartTask) {
        super(startTask);
        this._initUserIdentity();
        console.log("Ident", startTask.userIdentity, this.userIdentitySummary);
    }

    private _initUserIdentity() {
        const userIdentity = this.original.userIdentity;
        let value;
        if (!userIdentity || (!userIdentity.userName && !userIdentity.autoUser)) {
            value = "Task user";
        } else if (userIdentity.autoUser) {
            const isAdmin = userIdentity.autoUser.elevationLevel === UserAccountElevationLevel.admin;
            const isPoolScope = userIdentity.autoUser.scope === AutoUserScope.pool;
            const scope = isPoolScope ? "Pool default user" : "Task default user";
            if (isAdmin) {
                value = `${scope} (Admin)`;
            } else {
                value = scope;
            }
        } else {
            value = userIdentity.userName;
        }

        this.userIdentitySummary = value;
    }
}
