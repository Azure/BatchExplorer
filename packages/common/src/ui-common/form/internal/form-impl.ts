import EventEmitter from "events";
import TypedEventEmitter from "typed-emitter";
import { cloneDeep, delay, OrderedMap } from "../../util";
import { Entry, EntryInit } from "../entry";
import type {
    Form,
    FormEventMap,
    FormInit,
    FormValues,
    ValidationOpts,
} from "../form";
import { Item } from "../item";
import {
    AbstractParameter,
    Parameter,
    ParameterConstructor,
    ParameterDependencies,
    ParameterInit,
    ParameterName,
} from "../parameter";
import { Section, SectionInit } from "../section";
import { SubForm, SubFormInit } from "../subform";
import { ValidationSnapshot } from "../validation-snapshot";
import { ValidationStatus } from "../validation-status";

const defaultValidationOpts = { force: false };

// If there is an async validation in progress, how long to wait before
// calling another async validation.
const asyncValidationDelay = 300;

/**
 * Internal form implementation
 */
export class FormImpl<V extends FormValues> implements Form<V> {
    // A copy of the form's initial values used for resetting the form
    private _initialValuesCopy?: V;

    title?: string;
    description?: string;

    onValidateSync?: (values: V) => ValidationStatus;

    onValidateAsync?: (values: V) => Promise<ValidationStatus>;

    get validationSnapshot(): ValidationSnapshot<V> {
        return this._validationSnapshot;
    }

    get validationStatus(): ValidationStatus | undefined {
        return this._validationSnapshot?.overallStatus;
    }

    get entryValidationStatus(): {
        [name in ParameterName<V>]?: ValidationStatus;
    } {
        return this._validationSnapshot.entryStatus;
    }

    // The currently validation state. Note that this can be superceded by
    // another snapshot before validation finishes when validate() is called
    // again
    private _validationSnapshot: ValidationSnapshot<V> = new ValidationSnapshot(
        this.values,
        true
    );

    _emitter = new EventEmitter() as TypedEventEmitter<{
        change: (newValues: V, oldValues: V) => void;
        validate: (snapshot: ValidationSnapshot<V>) => void;
    }>;

    get childEntriesCount(): number {
        return this._childEntries.size;
    }

    get allEntriesCount(): number {
        return this._allEntries.size;
    }

    private _values: V;

    get values(): Readonly<V> {
        return this._values;
    }

    /**
     * Includes all entries for the entire form, including nested parameters,
     * sections and subforms, but *not* entries inside form objects associated
     * with subforms.
     */
    private _allEntries: Map<string, Entry<V>> = new Map();

    /**
     * Only includes direct children of the form (not those inside sections).
     * Ordered in display-order.
     */
    private _childEntries: OrderedMap<string, Entry<V>> = new OrderedMap();

    constructor(init: FormInit<V>) {
        this._values = init.values;

        // Clone a copy of the form's values so we can reset it
        this._initialValuesCopy = cloneDeep(this.values);

        this.title = init.title;
        this.description = init.description;

        if (init.onValidateSync) {
            this.onValidateSync = init.onValidateSync;
        }
        if (init.onValidateAsync) {
            this.onValidateAsync = init.onValidateAsync;
        }
    }

    childEntries(): IterableIterator<Entry<V>> {
        return this._childEntries.values();
    }

    allEntries(): IterableIterator<Entry<V>> {
        return this._allEntries.values();
    }

    getEntry(entryName: string): Entry<V> | undefined {
        return this._allEntries.get(entryName);
    }

    item(name: string, init?: EntryInit<V>): Item<V> {
        return new Item(this, name, init);
    }

    param<
        K extends ParameterName<V>,
        D extends ParameterDependencies<V> = ParameterDependencies<V>,
        T extends Parameter<V, K, D> = Parameter<V, K, D>
    >(
        name: K,
        parameterConstructor: ParameterConstructor<V, K, D, T>,
        init?: ParameterInit<V, K, D>
    ): T {
        return new parameterConstructor(this, name, init);
    }

    getParam<K extends ParameterName<V>>(name: K): Parameter<V, K> {
        const entry = this.getEntry(name);
        if (!(entry instanceof AbstractParameter)) {
            throw new Error(`Entry "${name}" is not a parameter`);
        }
        return entry;
    }

    section(name: string, init?: SectionInit<V>): Section<V> {
        return new Section(this, name, init);
    }

    getSection(name: string): Section<V> {
        const entry = this.getEntry(name);
        if (!(entry instanceof Section)) {
            throw new Error(`Entry "${name}" is not a section`);
        }
        return entry;
    }

    subForm<K extends ParameterName<V>, S extends V[K] & FormValues>(
        name: K,
        form: Form<S>,
        init?: SubFormInit<V, K>
    ): SubForm<V, K, S> {
        return new SubForm(this, name, form, init);
    }

    getSubForm<K extends ParameterName<V>, S extends V[K] & FormValues>(
        name: K
    ): SubForm<V, K, S> {
        const entry = this.getEntry(name);
        if (!(entry instanceof SubForm)) {
            throw new Error(`Entry "${name}" is not a sub-form`);
        }
        return entry;
    }

    reset(): void {
        if (this._initialValuesCopy) {
            this.setValues(this._initialValuesCopy);
        }
    }

    evaluate(): boolean {
        const propsChanged = this._updateDynamicProperties(this.values);
        if (propsChanged) {
            this._emitChangeEvent(this.values, this.values);
        }
        return propsChanged;
    }

    /**
     * Updates all dynamic properties across the form.
     *
     * @param values The current form values
     * @returns True if any properties were changed, false otherwise.
     */
    private _updateDynamicProperties(values: V): boolean {
        let propsChanged = false;
        for (const e of this.allEntries()) {
            if (e.dynamic) {
                // Get around type checking to make it easier to handle any type
                // of dynamic properties
                const entry: Record<string, unknown> = e as unknown as Record<
                    string,
                    unknown
                >;
                for (const pair of Object.entries(e.dynamic)) {
                    const prop = pair[0];
                    const evalFunc = pair[1];
                    const oldPropValue = entry[prop];
                    const newPropValue = evalFunc(values);
                    if (oldPropValue !== newPropValue) {
                        if (!propsChanged) {
                            propsChanged = true;
                        }
                        entry[prop] = newPropValue;
                    }
                }
            }
        }
        return propsChanged;
    }

    private _formValuesChanged(newValues: V, oldValues: V) {
        this._updateDynamicProperties(newValues);
        this._emitChangeEvent(newValues, oldValues);
    }

    private _emitChangeEvent(newValues: V, oldValues: V) {
        this._emitter.emit("change", newValues, oldValues);
    }

    private _emitValidateEvent(snapshot: ValidationSnapshot<V>) {
        this._emitter.emit("validate", snapshot);
    }

    setValues(values: V): void {
        const oldValues = this._values;
        if (oldValues === values) {
            // No-op if values haven't changed
            return;
        }
        this._values = values;
        this._formValuesChanged(values, oldValues);
    }

    updateValue<K extends ParameterName<V>>(name: K, value: V[K]): void {
        if (this.values[name] === value) {
            // No-op if the value hasn't changed
            return;
        }
        const newValues = cloneDeep(this.values) as V;
        newValues[name] = value;
        this.setValues(newValues);
    }

    async validate(opts?: ValidationOpts): Promise<ValidationSnapshot<V>> {
        if (!opts) {
            opts = defaultValidationOpts;
        }
        const snapshot = new ValidationSnapshot(this.values);
        const previousValidationInProgress =
            this._validationSnapshot.validationCompleteDeferred.done !== true;

        this._validationSnapshot = snapshot;
        this.validateSync(snapshot, opts);

        // Fire a validation event to allow updates after synchronous
        // validation to happen immediately
        this._emitValidateEvent(snapshot);

        // Yield before doing any async validation to check if another validation
        // attempt has come in.
        let delayMs = 0;
        if (
            !opts.force &&
            !this._validationSnapshot.isInitialSnapshot &&
            previousValidationInProgress
        ) {
            // Go more slowly if there is an async validation in progress to
            // avoid performing too many expensive operations
            delayMs = asyncValidationDelay;
        }
        await delay(delayMs);

        if (this._checkAndCancelValidationSnapshot(snapshot, opts.force)) {
            return snapshot;
        }

        await this.validateAsync(snapshot, opts);

        if (this._checkAndCancelValidationSnapshot(snapshot, opts.force)) {
            return snapshot;
        }

        // This snapshot is done, and is now the current in-effect snapshot
        snapshot.validationCompleteDeferred.resolve();
        snapshot.updateOverallStatus();
        this._validationSnapshot = snapshot;

        this._emitValidateEvent(snapshot);

        if (!snapshot.overallStatus) {
            // Hitting this indicates a bug. This shouldn't ever be undefined
            // at this point.
            throw new Error("Failed to compute overall validation status");
        }

        return snapshot;
    }

    validateSync(
        snapshot: ValidationSnapshot<V>,
        opts: ValidationOpts
    ): ValidationSnapshot<V> {
        // Call validateAsync() for each entry but don't block
        // on completion
        for (const entry of this.allEntries()) {
            if (entry instanceof AbstractParameter) {
                const entryName = entry.name as ParameterName<V>;
                const status = entry.validateSync();
                status.forced = opts.force;
                snapshot.entryStatus[entryName] = status;
            } else if (entry instanceof SubForm) {
                entry.validateSync(entry.form.validationSnapshot, opts);

                const entryName = entry.name as ParameterName<V>;

                // Note: this will often be undefined because full
                //       validation hasn't run
                snapshot.entryStatus[entryName] =
                    entry.form.validationSnapshot.overallStatus;
            }
        }

        // Run overall form onValidateSync callback
        if (this.onValidateSync) {
            snapshot.onValidateSyncStatus = this.onValidateSync(
                snapshot.values
            );
            snapshot.onValidateSyncStatus.forced = opts.force;
        }

        snapshot.syncValidationComplete = true;

        return snapshot;
    }

    async validateAsync(
        snapshot: ValidationSnapshot<V>,
        opts: ValidationOpts
    ): Promise<ValidationSnapshot<V>> {
        const validatingEntries = [];
        const validationPromises = [];
        const newValidationStatuses: { [name in keyof V]?: ValidationStatus } =
            {};

        // Call validateAsync() for each entry but don't block
        // on completion
        for (const entry of this.allEntries()) {
            const entryName = entry.name as ParameterName<V>;
            if (entry instanceof AbstractParameter) {
                if (snapshot.entryStatus[entryName]?.level === "error") {
                    // Don't run async validation if sync validation
                    // has already failed for this parameter
                    continue;
                }

                validatingEntries.push(entry);
                validationPromises.push(
                    entry.validateAsync().then((status) => {
                        status.forced = opts.force;
                        newValidationStatuses[entryName] = status;
                        return status;
                    })
                );
            } else if (entry instanceof SubForm) {
                validatingEntries.push(entry);
                validationPromises.push(
                    entry
                        .validateAsync(entry.form.validationSnapshot, opts)
                        .then((snapshot) => {
                            newValidationStatuses[entryName] =
                                snapshot.overallStatus;
                            return snapshot.overallStatus;
                        })
                );
            }
        }

        await Promise.all(validationPromises);

        if (this._checkAndCancelValidationSnapshot(snapshot, opts.force)) {
            return snapshot;
        }

        // All entries have validated
        for (const entry of validatingEntries) {
            const entryName = entry.name as ParameterName<V>;
            if (snapshot.entryStatus[entryName]?.level !== "error") {
                snapshot.entryStatus[entryName] =
                    newValidationStatuses[entryName];
            }
        }

        // Run overall form onValidateAsync callback
        if (this.onValidateAsync) {
            snapshot.onValidateAsyncStatus = await this.onValidateAsync(
                snapshot.values
            );
            snapshot.onValidateAsyncStatus.forced = opts.force;
        }

        snapshot.asyncValidationComplete = true;

        return snapshot;
    }

    /**
     * Checks to make sure the current validation snapshot is the most recent.
     * If not, sets the validation status to error with a message saying
     * the validation was canceled.
     *
     * @return True if the snapshot was canceled. False otherwise.
     */
    private _checkAndCancelValidationSnapshot(
        snapshot: ValidationSnapshot<V>,
        isFinalValidation?: boolean
    ): boolean {
        if (!isFinalValidation && this._validationSnapshot !== snapshot) {
            snapshot.overallStatus = new ValidationStatus(
                "canceled",
                "Validation canceled"
            );
            snapshot.validationCompleteDeferred.resolve();
            return true;
        }
        return false;
    }

    async waitForValidation(): Promise<ValidationStatus | undefined> {
        // Yield to give a chance for other blocking calls to validate()
        // to happen first
        await delay();

        while (true) {
            const lastSeenSnapshot = this._validationSnapshot;
            if (!lastSeenSnapshot) {
                break;
            }

            // There is validation in progress. Wait for it to finish
            // before resolving our promise.
            await lastSeenSnapshot.validationCompleteDeferred.promise;

            // If the snapshot we were waiting on is still the most
            // recent, we're done. Otherwise continue to loop and wait for the
            // new validation promise.
            if (lastSeenSnapshot === this._validationSnapshot) {
                break;
            }
        }
        return this.validationStatus;
    }

    on<E extends keyof FormEventMap<V>>(
        event: E,
        handler: FormEventMap<V>[E]
    ): FormEventMap<V>[E] {
        this._emitter.addListener(event, handler);
        return handler;
    }

    off<E extends keyof FormEventMap<V>>(
        event: E,
        handler: FormEventMap<V>[E]
    ): void {
        this._emitter.removeListener(event, handler);
    }

    /**
     * Internal method to register a new entry in this form.
     *
     * Note this isn't truly private because it is called by form entries
     * when they are created, but because it only exists on the implementation,
     * not the Form interface, it is effectively private to this file.
     *
     * @param entry The entry to register
     */
    _registerEntry(entry: Entry<V>): void {
        if (this._allEntries.has(entry.name)) {
            throw new Error(
                `An entry named "${entry.name}" already exists in the form`
            );
        }
        this._allEntries.set(entry.name, entry);
        if (!entry.parentSection) {
            // This isn't inside a section, so it's a direct child of the form
            this._childEntries.set(entry.name, entry);
        }
    }
}
