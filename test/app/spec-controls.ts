// tslint:disable:only-arrow-functions
// tslint:disable:no-console
import { DataCacheTracker } from "app/services/core";
import { GenericView } from "app/services/core/data/generic-view";
import { MockEntityView, MockListView } from "test/utils/mocks";

/**
 * Contains hooks that check the specs are clenanup resources correctly and other
 */

afterEach(() => {
    // Remove all caches created
    DataCacheTracker.disposeAll();
});

const viewCreated = {};
let lastInit;
let lastDispose;
let counter = 0;

jasmine.getEnv().addReporter({
    specStarted: (result) => {
        lastInit = GenericView.prototype.init;
        const dispose = GenericView.prototype.dispose;
        lastDispose = dispose;
        GenericView.prototype.init = function (this: any) {
            if (!(this instanceof MockEntityView || this instanceof MockListView)) {
                this.id = counter++;
                viewCreated[this.id] = result.fullName;
            }
        };
        GenericView.prototype.dispose = function (this: any) {
            if (!(this instanceof MockEntityView || this instanceof MockListView)) {
                delete viewCreated[this.id];
                dispose.bind(this)();
            }
        };
    },
    specDone: (result) => {
        GenericView.prototype.init = lastInit;
        GenericView.prototype.dispose = lastDispose;
        if (result.status === "disabled") { return; }
    },

    jasmineDone: () => {
        const ids = Object.keys(viewCreated);
        if (ids.length > 0) {
            console.warn("=".repeat(100));
            console.warn(`There was component with non cleaned views ${ids.length}`);
            console.warn("-".repeat(100));

            for (const id of ids) {
                const description = viewCreated[id];
                console.warn(`  - ${description}`);
            }
            console.warn("=".repeat(100));
        }
    },
});
