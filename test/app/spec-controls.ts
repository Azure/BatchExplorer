/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable no-console */
import { DataCacheTracker, GenericView } from "@batch-flask/core";
import { Observable } from "rxjs";
import { MockEntityView, MockListView } from "test/utils/mocks";

/**
 * Contains hooks that check the specs are clenanup resources correctly and other
 */

afterEach(() => {
    // Remove all caches created
    DataCacheTracker.disposeAll();
});

// Generic view
let viewCreated = {};
let lastInit;
let lastDispose;

// Observable
let subscriptionCreated = {};
let lastSubscribe;
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

        viewCreated = {};
    },
});

beforeEach(() => {
    const subscribe = Observable.prototype.subscribe;
    lastSubscribe = subscribe;

    Observable.prototype.subscribe = function (this: any, ...args) {
        const sub = subscribe.bind(this)(...args);
        sub.id = counter++;
        subscriptionCreated[sub.id] = {
            sub: sub,
        };
        return sub;
    };
});

afterEach(() => {
    Observable.prototype.subscribe = lastSubscribe;
    const subIds = Object.keys(subscriptionCreated);
    if (subIds.length > 0) {
        for (const value of Object.values(subscriptionCreated) as any) {
            value.sub.unsubscribe();
        }
    }

    subscriptionCreated = {};
});
