import { IpcPromiseEvent } from "common/constants";
import { ipcMain } from "electron";
import { EventEmitter } from "events";

const eventEmitter = new EventEmitter();

/**
 * listen event.
 *
 * @param {String} event event name.
 * @param {Function} listener listener function.
 */
export function on(event: string, listener: (...args) => Promise<any>) {
    // call from main process always.

    // add listener to common event emitter for main process.
    eventEmitter.on(event, (id, data, ipcEvent) => {
        listener(data, ipcEvent)
            .then((result) => {
                eventEmitter.emit(getSuccessEventName(event, id), result);
            })
            .catch((result) => {
                eventEmitter.emit(getFailureEventName(event, id), result);
            });
    });
}

// get temporary event name for success
function getSuccessEventName(eventName, id) {
    return eventName + id.toString() + IpcPromiseEvent.successSuffix;
}

// get temporary event name for failure
function getFailureEventName(eventName, id) {
    return eventName + id.toString() + IpcPromiseEvent.failureSuffix;
}

/**
 * common event handler for ipc.
 *
 * @private
 * @param {Event} event event object.
 * @param {Object} arg argument object.
 */
function rendererEventHandler(event, arg) {
    // NOTE: send from renderer process always.
    const successEventName = getSuccessEventName(arg.eventName, arg.id);
    const failureEventName = getFailureEventName(arg.eventName, arg.id);

    const onSuccess = (result) => {
        // send success to ipc for renderer process.
        event.sender.send(IpcPromiseEvent.responseSuccess, {
            data: result,
            eventName: arg.eventName,
            id: arg.id,
        });
        eventEmitter.removeListener(successEventName, onSuccess);
        eventEmitter.removeListener(failureEventName, onFailure);
    };
    const onFailure = (result) => {
        // send failure to ipc for renderer process.
        event.sender.send(IpcPromiseEvent.responseFailure, {
            data: result,
            eventName: arg.eventName,
            id: arg.id,
        });
        eventEmitter.removeListener(successEventName, onSuccess);
        eventEmitter.removeListener(failureEventName, onFailure);
    };

    // add listener to common event emitter for main process.
    eventEmitter.on(successEventName, onSuccess);
    eventEmitter.on(failureEventName, onFailure);

    // emit to common event emitter for main process.
    eventEmitter.emit(arg.eventName, arg.id, arg.data, event);
}

ipcMain.on(IpcPromiseEvent.request, rendererEventHandler);
