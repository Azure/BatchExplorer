import { Stack } from "@fluentui/react/lib/Stack";
import * as React from "react";
import { ContentPane } from "./content-pane";

interface DisplayPaneProps {
    title?: string;
    subtitle?: string;
}

interface DisplayPaneState {
    hasError: boolean;
    errorDetails?: {
        error: Error;
        errorInfo: React.ErrorInfo;
    };
}

/**
 * A container for a display component (which corresponds to a blade when used
 * in the Azure Portal). Acts as an error boundary and displays any caught
 * errors.
 */
export class DisplayPane extends React.Component<
    DisplayPaneProps,
    DisplayPaneState
> {
    constructor(props: Record<string, never>) {
        super(props);
        this.state = {
            hasError: false,
        };
    }

    static getDerivedStateFromError(
        error: Error,
        errorInfo: React.ErrorInfo
    ): DisplayPaneState {
        return {
            hasError: true,
            errorDetails: {
                error: error,
                errorInfo: errorInfo,
            },
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        this.setState({
            hasError: true,
            errorDetails: {
                error: error,
                errorInfo: errorInfo,
            },
        });
    }

    render(): React.ReactNode {
        let titleContainer: JSX.Element = <></>;
        if (this.props.title) {
            titleContainer = (
                <Stack
                    style={{
                        borderBottom: "1px solid black",
                        paddingBottom: "16px",
                    }}
                >
                    <h2 style={{ marginBottom: "4px" }}>{this.props.title}</h2>
                    {this.props.subtitle && <div>{this.props.subtitle}</div>}
                </Stack>
            );
        }

        return (
            <ContentPane>
                {titleContainer}
                {this._renderContent()}
            </ContentPane>
        );
    }

    private _renderContent(): React.ReactNode {
        if (this.state.hasError) {
            const details = this.state.errorDetails;
            return (
                <div
                    style={{
                        backgroundColor: "#50000b",
                        color: "white",
                        padding: "8px",
                    }}
                >
                    {details?.error && (
                        <>
                            <div>
                                <h2>Error: {details.error.message}</h2>
                            </div>
                            <div>
                                <strong>Stack Trace:</strong>
                                <pre>{`${details.error.stack?.trim()}`}</pre>
                            </div>
                        </>
                    )}
                    {details?.errorInfo && (
                        <>
                            <div>
                                <strong>Component Info:</strong>
                                <pre>{`${details.errorInfo.componentStack.trim()}`}</pre>
                            </div>
                        </>
                    )}
                </div>
            );
        }
        return this.props.children;
    }
}
