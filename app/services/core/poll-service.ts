import { ObjectUtils, SecureUtils } from "app/utils";


export class PollService {
    private _pollTrackers: StringMap<StringMap<PollTracker>> = {};
    private _activePoolTrackers: StringMap<PollTracker> = {};


    public startPoll(key: string, interval: number, callback: Function): PollObservable {
        const tracker = new PollTracker(interval, callback);
        this._addTracker(key, tracker);
        return new PollObservable(this, key, tracker.id);
    }

    public stopPoll(key: string, id: string) {
        this._stopPoll(key, id);
    }

    public updateKeyFor(currentKey: string, id: string, newKey: string) {
        const tracker = this._stopPoll(currentKey, id);
        if (!tracker) {
            return;
        }
        this._addTracker(newKey, tracker);
    }

    private _updateActivePoll(key: string) {
        const trackers = this._pollTrackers[key];
        if (Object.keys(trackers).length === 0) {
            return;
        }
        const smallest = ObjectUtils.values(trackers).reduce((a, b) => a.interval < b.interval ? a : b);
        this._activePoolTrackers[key] = smallest;
    }

    private _clearActivePoll(key: string) {
        if (!(key in this._activePoolTrackers)) {
            return;
        }

        this._activePoolTrackers[key].stop();
        delete this._activePoolTrackers[key];
    }

    private _startActivePoll(key: string) {
        if (!(key in this._activePoolTrackers)) {
            return;
        }
        this._activePoolTrackers[key].start();
    }

    private _getTracker(key: string, id: string) {
        if (!(key in this._pollTrackers && id in this._pollTrackers[key])) {
            return null;
        }
        return this._pollTrackers[key][id];
    }

    private _addTracker(key: string, tracker: PollTracker) {
        if (!(key in this._pollTrackers)) {
            this._pollTrackers[key] = {};
        }
        this._pollTrackers[key][tracker.id] = tracker;
        this._clearActivePoll(key);
        this._updateActivePoll(key);
        this._startActivePoll(key);
    }

    private _stopPoll(key: string, id: string) {
        const tracker = this._getTracker(key, id);
        if (!tracker) {
            return;
        }
        delete this._pollTrackers[key][id];
        if (tracker.running) {
            this._clearActivePoll(key);
            this._updateActivePoll(key);
            this._startActivePoll(key);
        }
        return tracker;
    }
}

class PollTracker {
    public id: string;
    private _currentInterval: any;

    constructor(public interval: number, public callback: Function) {
        this.id = SecureUtils.uuid();
    }

    public get running(): boolean {
        return Boolean(this._currentInterval);
    }

    public start() {
        this.stop();
        this._currentInterval = setInterval(() => {
            this.callback();
        }, this.interval);
    }

    public stop() {
        if (this._currentInterval) {
            clearInterval(this._currentInterval);
        }
    }
}

export class PollObservable {
    constructor(private service: PollService, private key: string, private id: string) { }

    public destroy() {
        this.service.stopPoll(this.key, this.id);
    }

    public updateKey(newKey: string) {
        if (newKey === this.key) {
            return;
        }
        this.service.updateKeyFor(this.key, this.id, newKey);
        this.key = newKey;
    }
}
