import { render } from "@testing-library/react";
import { VmExtensionDetailsPanel } from "../vm-extension-details-panel";
import { failedExtItem, succeededExtItem } from "../mock-vme-ext-items";
import * as React from "react";
import { initMockBrowserEnvironment } from "@azure/bonito-ui";
import { runAxe } from "@azure/bonito-ui/lib/test-util/a11y";
import { translate } from "@azure/bonito-core";
import userEvent from "@testing-library/user-event";

describe("VmExtensionDetailsPanel", () => {
    beforeEach(() => initMockBrowserEnvironment());

    it("should render if isOpen", async () => {
        const onDismiss = jest.fn();
        const { container, getByText } = render(
            <VmExtensionDetailsPanel
                isOpen={true}
                vme={succeededExtItem}
                onDismiss={onDismiss}
            />
        );
        getByText(translate("lib.react.vmExtension.extensionProperties"));
        expect(await runAxe(container)).toHaveNoViolations();
    });

    it("should not render if not isOpen", async () => {
        const onDismiss = jest.fn();
        const { getByText } = render(
            <VmExtensionDetailsPanel
                isOpen={false}
                vme={succeededExtItem}
                onDismiss={onDismiss}
            />
        );
        expect(() =>
            getByText(translate("lib.react.vmExtension.extensionProperties"))
        ).toThrow();
    });

    it("should not render if vme is undefined", async () => {
        const onDismiss = jest.fn();
        const { getByText } = render(
            <VmExtensionDetailsPanel
                isOpen={true}
                vme={undefined}
                onDismiss={onDismiss}
            />
        );
        expect(() =>
            getByText(translate("lib.react.vmExtension.extensionProperties"))
        ).toThrow();
    });

    it('should render detail status panel when "View detailed status" is clicked', async () => {
        const onDismiss = jest.fn();
        const { getByText, getAllByText } = render(
            <VmExtensionDetailsPanel
                isOpen={true}
                vme={failedExtItem}
                onDismiss={onDismiss}
            />
        );
        const viewDetailedStatus = getByText(
            translate("lib.react.vmExtension.viewDetailedStatus")
        ) as HTMLButtonElement;

        await userEvent.click(viewDetailedStatus);

        expect(
            getAllByText(translate("lib.react.vmExtension.viewDetailedStatus"))
                .length
        ).toBe(2);
    });
});
