import { PoolVMExtList } from "../pool-vm-ext-list";

import { render, waitFor } from "@testing-library/react";
import React from "react";
import { translate } from "@azure/bonito-core";
import { initMockBatchBrowserEnvironment } from "../../environment";

const poolArmIdWithExt =
    "/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/supercomputing/providers/microsoft.batch/batchaccounts/hobo/pools/hobopool1";

describe("PoolVMExtList", () => {
    beforeEach(() => {
        initMockBatchBrowserEnvironment();
    });

    it("should render vm extension lists", async () => {
        const { getByText } = render(
            <PoolVMExtList poolArmId={poolArmIdWithExt} />
        );
        getByText(translate("lib.react.vmExtension.name"));
        await waitFor(() => getByText("batchextension1"));
    });

    it("should render vm extension lists with no result", async () => {
        const { getByText } = render(
            <PoolVMExtList
                poolArmId={poolArmIdWithExt.replace("hobopool1", "nonexist")}
            />
        );
        getByText(translate("lib.react.vmExtension.name"));
        await waitFor(() =>
            getByText(translate("lib.react.vmExtension.noResult"))
        );
    });
});
