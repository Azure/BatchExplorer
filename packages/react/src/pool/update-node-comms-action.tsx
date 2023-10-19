import { AbstractAction } from "@azure/bonito-core/lib/action";
import {
    Form,
    StringListParameter,
    StringListVData,
    StringParameter,
    ValidationStatus,
} from "@azure/bonito-core/lib/form";
import {
    NodeCommunicationMode,
    PoolOutput,
    PoolService,
} from "@batch/ui-service/lib/pool";
import { Link } from "@fluentui/react/lib/Link";
import { MessageBar, MessageBarType } from "@fluentui/react/lib/MessageBar";
import { format } from "@fluentui/react/lib/Utilities";
import * as React from "react";
import {
    NodeCommsParameter,
    NODE_COMMS_MODE_DEFAULT,
} from "./node-comms-parameter";
import { translate } from "@azure/bonito-core/lib/localization";
import { inject } from "@azure/bonito-core/lib/environment";
import { BatchDependencyName } from "@batch/ui-service/lib/environment";
import { createReactForm } from "@azure/bonito-ui/lib/form";

export type UpdateNodeCommsFormValues = {
    currentNodeCommunicationMode?: string;
    targetNodeCommunicationMode?: NodeCommunicationMode;
    stringList?: string[];
};

export class UpdateNodeCommsAction extends AbstractAction<UpdateNodeCommsFormValues> {
    actionName = "UpdateNodeCommunicationMode";

    private _poolService: PoolService = inject(BatchDependencyName.PoolService);

    private _batchAccountId: string;
    private _poolName: string;
    private _poolArmId: string;

    private _pool?: PoolOutput;

    async onInitialize(): Promise<UpdateNodeCommsFormValues> {
        this._pool = await this._poolService.get(this._poolArmId, {
            commandName: "UpdateNodeCommsAction/GetPool",
        });

        if (!this._pool) {
            return {};
        }

        return {
            currentNodeCommunicationMode:
                this._pool.properties?.currentNodeCommunicationMode ??
                translate("bonito.core.notApplicable"),
            targetNodeCommunicationMode:
                this._pool.properties?.targetNodeCommunicationMode ??
                NODE_COMMS_MODE_DEFAULT,
        };
    }

    constructor(batchAccountId: string, poolName: string) {
        super();
        this._batchAccountId = batchAccountId;
        this._poolName = poolName;
        this._poolArmId = `${this._batchAccountId}/pools/${this._poolName}`;
    }

    buildForm(
        initialValues: UpdateNodeCommsFormValues
    ): Form<UpdateNodeCommsFormValues> {
        const form = createReactForm<UpdateNodeCommsFormValues>({
            values: initialValues,
        });

        form.param("currentNodeCommunicationMode", StringParameter, {
            label: translate(
                "lib.react.pool.parameter.currentNodeCommunicationMode.label"
            ),
            disabled: true,
        });

        form.param("targetNodeCommunicationMode", NodeCommsParameter, {
            label: translate(
                "lib.react.pool.parameter.targetNodeCommunicationMode.label"
            ),
        });

        const a = (value: any) => {
            const data = {
                1: "1",
                2: "2",
            };
            return new ValidationStatus(
                "ok",
                "",
                data
            ) as ValidationStatus<StringListVData>;
        };

        form.param("stringList", StringListParameter, {
            label: translate(
                "lib.react.pool.parameter.targetNodeCommunicationMode.label"
            ),
            // xxx: "xxx" as StringListVData,
            onValidateSync: () => {
                const data: StringListVData = {
                    1: "1",
                    2: "2",
                };
                return new ValidationStatus("ok", "", data);
            },
        });

        form.item("help", {
            dynamic: {
                hidden: (values) => {
                    return (
                        values.currentNodeCommunicationMode ===
                        (values.targetNodeCommunicationMode ?? "Default")
                    );
                },
            },
            render: (props) => {
                const { values } = props;
                return (
                    // TODO: Would be good to have a message bar component in the
                    //       shared libs.
                    <MessageBar
                        messageBarType={MessageBarType.warning}
                        isMultiline={true}
                    >
                        {format(
                            translate(
                                "lib.react.pool.infoBox.nodeCommsModeDiffers.message"
                            ),
                            values.currentNodeCommunicationMode,
                            values.targetNodeCommunicationMode
                        )}
                        <Link
                            href="https://learn.microsoft.com/azure/batch/simplified-compute-node-communication"
                            target="_blank"
                            underline
                        >
                            {translate("bonito.core.learnMoreLinkText")}
                        </Link>
                    </MessageBar>
                );
            },
        });

        return form;
    }

    onValidateSync(): ValidationStatus {
        if (!this._pool) {
            return new ValidationStatus(
                "error",
                translate("lib.react.pool.notFound")
            );
        }
        return new ValidationStatus("ok");
    }

    async onExecute(values: UpdateNodeCommsFormValues): Promise<void> {
        await this._poolService.patch(
            {
                id: this._poolArmId,
                properties: {
                    targetNodeCommunicationMode:
                        values.targetNodeCommunicationMode,
                },
            },
            { commandName: "UpdateNodeCommsAction/PatchPool" }
        );
    }
}
