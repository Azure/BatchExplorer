import { initMockEnvironment } from "../../environment";
import { delayedCallback } from "../../util";
import { delay } from "../../util/functions";
import { BooleanParameter } from "../boolean-parameter";
import { createForm, FormValues } from "../form";
import { NumberParameter } from "../number-parameter";
import {
    AbstractParameter,
    ParameterDependencies,
    ParameterName,
} from "../parameter";
import { StringListParameter } from "../string-list-parameter";
import { StringParameter } from "../string-parameter";
import { ValidationSnapshot } from "../validation-snapshot";
import { ValidationStatus } from "../validation-status";

describe("Form tests", () => {
    beforeEach(() => initMockEnvironment());

    test("Single parameter", () => {
        type HelloWorldFormValues = {
            message: string;
        };

        const form = createForm<HelloWorldFormValues>({
            values: {
                message: "Hello world!",
            },
        });
        expect(form.allEntriesCount).toEqual(0);
        expect(form.values).toEqual({ message: "Hello world!" });

        const messageParam = form.param("message", StringParameter, {
            value: "Hello galaxy!",
        });
        expect(form.allEntriesCount).toEqual(1);
        expect(form.values).toEqual({ message: "Hello galaxy!" });

        // Adding an item doesn't change the form values
        form.item("Banner", {
            title: "This is an important message",
        });
        expect(form.allEntriesCount).toEqual(2);
        expect(form.values).toEqual({ message: "Hello galaxy!" });

        messageParam.value = "Hello universe!";
        expect(form.values).toEqual({ message: "Hello universe!" });

        // Can't add duplicate parameters
        expect(() => form.param("message", StringParameter)).toThrow();
    });

    test("Dynamic parameters", () => {
        type HelloWorldFormValues = {
            hideMessage: boolean;
            message: string;
        };

        const form = createForm<HelloWorldFormValues>({
            values: {
                hideMessage: false,
                message: "Hello world!",
            },
        });

        const hideMessageParam = form.param("hideMessage", BooleanParameter);
        const messageParam = form.param("message", StringParameter, {
            label: "Not evaluated yet",
            dynamic: {
                hidden: (values) => values.hideMessage,
                label: (values) =>
                    values.hideMessage == true
                        ? "Hidden message"
                        : "Visible message",
            },
        });

        // Test dynamic property evaluation
        expect(messageParam.hidden).toBe(false);
        expect(messageParam.label).toEqual("Not evaluated yet");
        form.evaluate();
        expect(messageParam.hidden).toBe(false);
        expect(messageParam.label).toEqual("Visible message");
        hideMessageParam.value = true;
        expect(messageParam.hidden).toBe(true);
        expect(messageParam.label).toEqual("Hidden message");
    });

    test("Multiple parameters with nested sections", async () => {
        type CarFormValues = {
            make?: "Ford" | "Tesla" | "Volkswagen";
            model?: string;
            milesPerCharge?: number;
            registeredDrivers?: string[];
            maxRegisteredDrivers?: number;
        };

        const form = createForm<CarFormValues>({
            values: {
                make: "Tesla",
            },
        });
        form.param("make", StringParameter, {
            label: "Make",
        });
        form.param("model", StringParameter, {
            label: "Model",
            value: "Model Y",
        });
        form.param("milesPerCharge", NumberParameter, {
            label: "Miles per charge",
        });

        // Top-level section
        const driversSection = form.section("Drivers");
        const driversParam = driversSection.param(
            "registeredDrivers",
            StringListParameter,
            {
                label: "Drivers",
            }
        );
        expect(form.values).toEqual({ make: "Tesla", model: "Model Y" });

        // Global entry count
        expect(form.allEntriesCount).toEqual(5);

        // Direct child count
        expect(form.childEntriesCount).toEqual(4);
        expect(driversSection.childEntriesCount).toEqual(1);

        // Nested section
        const advancedSection = driversSection.section("Advanced");
        const maxDriversParam = advancedSection.param(
            "maxRegisteredDrivers",
            NumberParameter
        );

        // Check that counts were updated correctly
        expect(form.allEntriesCount).toEqual(7);
        expect(form.childEntriesCount).toEqual(4);
        expect(driversSection.childEntriesCount).toEqual(2);
        expect(advancedSection.childEntriesCount).toEqual(1);

        // Check properties which cascade to child sections & parameters
        const checkParamCascade = (prop: "hidden" | "disabled") => {
            expect(driversParam[prop]).toBe(false);
            expect(advancedSection[prop]).toBe(false);
            expect(maxDriversParam[prop]).toBe(false);
            driversSection[prop] = true;
            expect(driversParam[prop]).toBe(true);
            expect(advancedSection[prop]).toBe(true);
            expect(maxDriversParam[prop]).toBe(true);
            driversSection[prop] = false;
            expect(driversParam[prop]).toBe(false);
            expect(advancedSection[prop]).toBe(false);
            expect(maxDriversParam[prop]).toBe(false);
        };
        checkParamCascade("hidden");
        checkParamCascade("disabled");

        // Check properties which cascade from sections to child sections only
        const checkSectionCascade = (prop: "expanded") => {
            expect(advancedSection[prop]).toBe(false);
            driversSection[prop] = true;
            expect(advancedSection[prop]).toBe(true);
            driversSection[prop] = false;
            expect(advancedSection[prop]).toBe(false);
        };
        checkSectionCascade("expanded");

        // Unhide parent section
        driversSection.hidden = false;

        form.setValues({
            make: "Ford",
            model: "Mustang Mach E",
            milesPerCharge: 300,
            registeredDrivers: ["George", "Abe"],
        });
        expect(form.values.registeredDrivers).toEqual(["George", "Abe"]);

        // Add a driver by changing the parameter
        driversParam.value = ["George", "Abe", "Teddy"];
        expect(form.values.registeredDrivers).toEqual([
            "George",
            "Abe",
            "Teddy",
        ]);

        // Other values are not affected
        expect(form.values.milesPerCharge).toEqual(300);

        await form.validate();
        expect(form.validationStatus?.level).toBe("ok");
    });

    test("Single sub-form", () => {
        interface TrollFormValues extends FormValues {
            applicant?: string;
            applicantHouseholdSize?: number;
            answers?: TrollAnswersFormValues;
        }

        interface TrollAnswersFormValues extends FormValues {
            color?: string;
            sparrowVelocity?: number;
        }

        const form = createForm<TrollFormValues>({
            values: {
                applicant: "Sir Gallahad",
            },
        });
        expect(form.values).toEqual({ applicant: "Sir Gallahad" });

        const applicantSection = form.section("Applicant Info");

        applicantSection.param("applicant", StringParameter, {
            value: "Sir Lancelot",
        });
        expect(form.values).toEqual({ applicant: "Sir Lancelot" });

        applicantSection.param("applicantHouseholdSize", NumberParameter, {
            value: 2,
        });
        expect(form.values).toEqual({
            applicant: "Sir Lancelot",
            applicantHouseholdSize: 2,
        });

        const subForm = form.subForm(
            "answers",
            createForm<TrollAnswersFormValues>({
                values: {
                    color: "red",
                },
            })
        );
        expect(subForm.values).toEqual({
            color: "red",
        });
        expect(form.values).toEqual({
            applicant: "Sir Lancelot",
            applicantHouseholdSize: 2,
            answers: {
                color: "red",
            },
        });
    });

    test("Validation", async () => {
        const form = createNationalParkForm();

        // Keep track of the latest validation state
        const validation: {
            snapshot: ValidationSnapshot<NationalParkFormValues> | undefined;
        } = {
            snapshot: undefined,
        };

        form.on("validate", (snapshot) => {
            validation.snapshot = snapshot;
        });

        const validationPromise = form.validate();

        // Sync validation has completed
        expect(validation.snapshot?.syncValidationComplete).toBe(true);
        expect(validation.snapshot?.asyncValidationComplete).toBe(false);
        expect(validation.snapshot?.onValidateSyncStatus?.level).toBe("ok");

        // Status will not be defined until all validation promises resolve
        expect(validation.snapshot?.overallStatus).toBeUndefined();
        expect(form.validationStatus).toBeUndefined();

        await validationPromise;

        // Async validation has completed
        expect(validation.snapshot?.syncValidationComplete).toBe(true);
        expect(validation.snapshot?.asyncValidationComplete).toBe(true);
        expect(validation.snapshot?.overallStatus?.level).toEqual("error");
        expect(form.validationStatus?.level).toEqual("error");

        // When there are multiple errors, the message includes the
        // error count
        expect(form.validationStatus?.message).toEqual("2 errors found");
        expect(form.entryValidationStatus.parkName?.level).toEqual("error");
        expect(form.entryValidationStatus.parkName?.message).toEqual(
            "Park name is required"
        );
        expect(form.entryValidationStatus.state?.level).toEqual("error");
        expect(form.entryValidationStatus.state?.message).toEqual(
            "State is required"
        );

        // Park name is invalid because of missing dependency
        form.updateValue("parkName", "Yosemite");
        await form.validate();
        expect(form.validationStatus?.level).toEqual("error");
        expect(form.validationStatus?.message).toEqual("2 errors found");
        expect(form.entryValidationStatus.parkName?.level).toEqual("error");
        expect(form.entryValidationStatus.parkName?.message).toEqual(
            "Cannot validate park name: no state selected"
        );
        expect(form.entryValidationStatus.state?.level).toEqual("error");
        expect(form.entryValidationStatus.state?.message).toEqual(
            "State is required"
        );

        form.updateValue("state", "California");
        await form.validate();
        // The state is now defined, but still invalid due to onValidate()
        expect(form.validationStatus?.level).toEqual("error");
        expect(form.validationStatus?.message).toEqual(
            "State must be exactly 2 characters"
        );

        form.updateValue("state", "CO");
        await form.validate();
        // Park name parameter validation failure through dependency on state
        expect(form.validationStatus?.level).toEqual("error");
        expect(form.validationStatus?.message).toEqual(
            "Invalid state selected. Valid options are: NY, New York, CA, California"
        );

        form.updateValue("state", "CA");
        await form.validate();
        // Good
        expect(form.validationStatus?.level).toEqual("ok");
        expect(form.validationStatus?.message).toBeUndefined();

        // Add a parameter with async validation
        form.param("squareMiles", NumberParameter, {
            onValidateAsync: async (value) => {
                return delayedCallback(() => {
                    if (value != null) {
                        if (typeof value !== "number") {
                            return new ValidationStatus(
                                "error",
                                "Value must be a number"
                            );
                        }
                        if (value <= 0) {
                            return new ValidationStatus(
                                "error",
                                "Mileage must be a positive number"
                            );
                        }
                    }
                    return new ValidationStatus("ok");
                }, 0);
            },
        });

        // Still valid when squareMiles is undefined
        await form.validate();
        expect(form.validationStatus?.level).toEqual("ok");
        expect(form.validationStatus?.message).toBeUndefined();

        // Invalid square mileage
        form.updateValue("squareMiles", -123);
        await form.validate();
        expect(form.validationStatus?.level).toEqual("error");
        expect(form.validationStatus?.message).toEqual(
            "Mileage must be a positive number"
        );

        form.updateValue("squareMiles", 1187);
        // Good
        await form.validate();
        expect(form.validationStatus?.level).toEqual("ok");
        expect(form.validationStatus?.message).toBeUndefined();

        // When calling validate() multiple times in rapid succession,
        // the last call always wins
        form.updateValue("squareMiles", -1);
        form.validate();
        form.updateValue("squareMiles", 1);
        form.validate();
        form.updateValue("squareMiles", "not-a-number" as unknown as number);
        await form.validate();
        expect(form.validationStatus?.level).toEqual("error");
        expect(form.validationStatus?.message).toEqual(
            "Value must be a number"
        );

        // Make the form valid again
        form.updateValue("squareMiles", 1);

        // Subsequence calls to validate() will cancel snapshots which
        // are in progress, but not if force is true
        const validateAndPreempt = (force: boolean = false) => {
            const promise = form.validate({ force });
            form.validate();
            return promise;
        };
        expect((await validateAndPreempt()).overallStatus?.level).toEqual(
            "canceled"
        );
        const forcedSnapshot = await validateAndPreempt(true);
        expect(forcedSnapshot.overallStatus?.level).toEqual("ok");

        // Make sure the 'forced' flag is set, so parameters know whether
        // they were run with forced validation. This is useful for displaying
        // all errors on the final form submit validation
        expect(forcedSnapshot.entryStatus.parkName?.forced).toBe(true);
    });

    test("waitForValidation() function", async () => {
        const form = createNationalParkForm();

        // Add a parameter with async validation
        form.param("squareMiles", NumberParameter, {
            required: true,
            onValidateAsync: async (value) => {
                return delayedCallback(() => {
                    if (value != null) {
                        if (value <= 0) {
                            return new ValidationStatus(
                                "error",
                                "Mileage must be a positive number"
                            );
                        }
                    }
                    return new ValidationStatus("ok");
                }, 0);
            },
        });

        // Begin in an error state
        await form.validate();
        expect(form.validationStatus?.level).toEqual("error");
        expect(form.entryValidationStatus.parkName?.level).toEqual("error");
        expect(form.entryValidationStatus.state?.level).toEqual("error");
        expect(form.entryValidationStatus.squareMiles?.level).toEqual("error");

        // Because waitForValidation() is always non-blocking, calling
        // it first here will still wait for subsequent blocking
        // calls to validate() to finish
        const validationPromise = form.waitForValidation();

        // Trigger many validations in a row, importantly including an async
        // validation so that the promise returned by waitForValidation() will
        // not immediately resolve. The form starts out in an invalid state
        // due to squareMiles and state.
        form.updateValue("parkName", "Yosemite");
        form.validate();
        form.updateValue("squareMiles", -123);
        form.validate();
        form.updateValue("state", "invalid");
        form.validate();
        form.updateValue("squareMiles", 1187);
        form.validate();
        form.updateValue("state", "CA");
        form.validate(); // Only this call actually makes the form valid

        const validationStatus = await validationPromise;
        expect(form.validationStatus?.level).toEqual("ok");

        // Form's validation status and the one returned by waitForValidation()
        // should be the exact same object reference
        expect(validationStatus).toBe(form.validationStatus);
    });

    test("Events", () => {
        type ElfType = {
            name: string;
            type: "Valyar" | "Noldor" | "Telerin";
        };
        const form = createForm<{
            hobbit: string;
            dwarf: string;
            elf?: ElfType;
        }>({
            values: {
                hobbit: "Bilbo",
                dwarf: "Gimli",
            },
        });

        form.param("hobbit", StringParameter);

        const onChangeSpy = jest.fn();
        const listener = form.on("change", onChangeSpy);

        form.updateValue("hobbit", "Frodo");

        expect(onChangeSpy).toHaveBeenCalledWith(
            {
                hobbit: "Frodo",
                dwarf: "Gimli",
            },
            {
                hobbit: "Bilbo",
                dwarf: "Gimli",
            }
        );
        form.off("change", listener);
        onChangeSpy.mockClear();

        form.updateValue("dwarf", "Thorin");
        expect(onChangeSpy).not.toHaveBeenCalled();

        const elfForm = form.subForm(
            "elf",
            createForm<ElfType>({
                values: {
                    type: "Noldor",
                    name: "Gil-Galad",
                },
            })
        );

        const elfChangeSpy = jest.fn();
        const elfListener = elfForm.on("change", elfChangeSpy);
        elfForm.updateValue("name", "Galadriel");

        expect(elfChangeSpy).toHaveBeenCalledWith(
            {
                type: "Noldor",
                name: "Galadriel",
            },
            {
                type: "Noldor",
                name: "Gil-Galad",
            }
        );
        elfForm.off("change", elfListener);
        elfChangeSpy.mockClear();

        elfForm.updateValue("name", "Feanor");
        expect(elfChangeSpy).not.toHaveBeenCalled();
    });

    test("Computed values using 'change' event", () => {
        let onChangeCount = 0;

        type NumberFormValues = {
            number: number;
            numberPlusOne?: number;
            numberPlusTwo?: number;
        };

        const form = createForm<NumberFormValues>({
            values: {
                number: 0,
            },
        });

        form.param("number", NumberParameter, {
            value: 1,
        });
        form.param("numberPlusOne", NumberParameter);
        form.param("numberPlusTwo", NumberParameter);

        form.on("change", (newValues) => {
            onChangeCount++;

            // Both setting the parameter value and calling updateValue
            // should fire change events
            form.getParam("numberPlusOne").value = newValues.number + 1;
            form.updateValue("numberPlusTwo", newValues.number + 2);
        });

        expect(onChangeCount).toBe(0);

        expect(form.values.number).toBe(1);
        expect(form.values.numberPlusOne).toBeUndefined();

        form.getParam("number").value = 2;

        // Fired three times: once for "number" and once for each computed value
        // inside the change handler
        expect(onChangeCount).toBe(3);

        expect(form.values.number).toBe(2);
        expect(form.values.numberPlusOne).toBe(3);
        expect(form.values.numberPlusTwo).toBe(4);
    });

    test("Reset to initial values", async () => {
        type AnimalFormValues = {
            family?: string;
            genus?: string;
            species?: string;
        };

        const form = createForm<AnimalFormValues>({
            values: {
                family: "Canidae",
                genus: "Canis",
                species: "Canis familiaris",
            },
            onValidateSync: (values) => {
                if (values.family !== "Canidae") {
                    return new ValidationStatus("error", "Dogs only!");
                }
                return new ValidationStatus("ok");
            },
        });

        await form.validate();
        expect(form.validationStatus?.level).toEqual("ok");

        // Change values and make the form invalid
        form.setValues({
            family: "Felidae",
            genus: "Felis",
            species: "Felis catus",
        });
        await form.validate();
        expect(form.validationStatus?.level).toEqual("error");
        expect(form.validationStatus?.message).toEqual("Dogs only!");

        // Resetting the form restores the original values, and makes the
        // form valid again
        form.reset();
        expect(form.values).toStrictEqual({
            family: "Canidae",
            genus: "Canis",
            species: "Canis familiaris",
        });
        await form.validate();
        expect(form.validationStatus?.level).toEqual("ok");
    });
});

type NationalParkFormValues = {
    parkName?: string;
    state?: string;
    squareMiles?: number;
};

const PARK_NAME_REGEX = /[A-Za-z\s]/;

function createNationalParkForm() {
    const form = createForm<NationalParkFormValues>({
        values: {},
        onValidateSync: (values) => {
            if (values.parkName === "Yosemite" && values.state !== "CA") {
                return new ValidationStatus(
                    "error",
                    "Invalid park/state combination"
                );
            }
            return new ValidationStatus("ok");
        },
    });

    form.param("parkName", ParkParameter, {
        dependencies: {
            state: "state",
        },
        label: "Park name",
        required: true,
        onValidateSync: (value) => {
            if (value && !PARK_NAME_REGEX.test(value)) {
                return new ValidationStatus(
                    "error",
                    "Invalid park name. Only letters and spaces are allowed."
                );
            }
            return new ValidationStatus("ok");
        },
    });

    form.param("state", StringParameter, {
        required: true,
        onValidateAsync: async (value) => {
            if (value && value.length === 2) {
                return new ValidationStatus("ok");
            }
            return new ValidationStatus(
                "error",
                "State must be exactly 2 characters"
            );
        },
    });

    return form;
}

const allowedStates = ["NY", "New York", "CA", "California"];

/**
 * A parameter for national park names which depends on a 'state'
 * parameter.
 */
class ParkParameter<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends ParameterDependencies<V, "state">
> extends AbstractParameter<V, K, D> {
    async validateAsync(): Promise<ValidationStatus> {
        let status = await super.validateAsync();
        await delay();
        if (status.level === "ok") {
            status = this._validate();
        }
        return status;
    }

    private _validate(): ValidationStatus {
        if (!this.dependencies || !this.dependencies.state) {
            return new ValidationStatus("error", "Missing 'state' dependency");
        }

        const state = this.getDependencyValueAsString("state");
        if (!state) {
            return new ValidationStatus(
                "error",
                "Cannot validate park name: no state selected"
            );
        }

        if (!allowedStates.includes(state)) {
            return new ValidationStatus(
                "error",
                "Invalid state selected. Valid options are: " +
                    allowedStates.join(", ")
            );
        }

        return new ValidationStatus("ok");
    }
}
