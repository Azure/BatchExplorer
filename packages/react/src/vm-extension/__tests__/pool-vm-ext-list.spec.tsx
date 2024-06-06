import { PoolVMExtList } from "../pool-vm-ext-list";

import { render, waitFor } from "@testing-library/react";
import React from "react";
import { translate } from "@azure/bonito-core";
import { initMockBatchBrowserEnvironment } from "../../environment";
import { dataGridIgnoredA11yRules } from "@azure/bonito-ui/lib/components/data-grid/test-ignore-a11y-rules";
import { runAxe } from "@azure/bonito-ui/lib/test-util/a11y";

const poolArmIdWithExt =
    "/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/supercomputing/providers/microsoft.batch/batchaccounts/hobo/pools/hobopool1";

describe("PoolVMExtList", () => {
    beforeEach(() => {
        initMockBatchBrowserEnvironment();
    });

    it("should render vm extension lists", async () => {
        const { getByText, container } = render(
            <PoolVMExtList poolResourceId={poolArmIdWithExt} />
        );
        getByText(translate("lib.react.vmExtension.name"));
        await waitFor(() => getByText("batchextension1"));
        expect(
            await runAxe(container, dataGridIgnoredA11yRules)
        ).toHaveNoViolations();
    });

    it("should render vm extension lists with no result", async () => {
        const { getByText } = render(
            <PoolVMExtList
                poolResourceId={poolArmIdWithExt.replace(
                    "hobopool1",
                    "nonexist"
                )}
            />
        );
        getByText(translate("lib.react.vmExtension.name"));
        await waitFor(() =>
            getByText(translate("lib.react.vmExtension.noResult"))
        );
    });
});
