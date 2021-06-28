import * as React from "react";
//import { headingStyle } from "../../../style";
import { DemoPane } from "../../../layout/demo-pane";
import { Image, IImageProps } from "@fluentui/react/lib/Image";
import { MonacoEditor } from "@batch/ui-react/lib/components";
import { HeightAndWidth } from "../../../functions";

export const GalleryApplicationDemo: React.FC = (props) => {
    const imageProps: IImageProps = {
        // Show a border around the image (just for demonstration purposes)
        styles: (props) => ({
            root: {
                border: theBorder + props.theme.palette.neutralSecondary,
                backgroundColor: theBackgroundColor,
                borderColor: theBorderColor,
                borderRadius: theBorderRadius,
                //borderCornerShape: "bevel",
                //borderStyle: "dotted",
            },
        }),
    };

    const [theSrc, setTheSrc] = React.useState<string | undefined>(
        "http://via.placeholder.com/350x150"
    );

    const [theWidth, setTheWidth] = React.useState<string | number | undefined>(
        100
    );

    const [theHeight, setTheHeight] = React.useState<
        string | number | undefined
    >(100);

    const [theBorder, setTheBorder] = React.useState<string | 0 | undefined>(
        "10px solid "
    );

    const [theLoading, setTheLoading] = React.useState<
        "eager" | "lazy" | undefined
    >("lazy");

    const [theMaximizeFrame, setTheMaximizeFrame] = React.useState<
        boolean | undefined
    >(true);

    const [theShouldStartVisible, setTheShouldStartVisible] = React.useState<
        boolean | undefined
    >(true);

    const [theShouldFadeIn, setTheShouldFadeIn] = React.useState<
        boolean | undefined
    >(true);

    const [theAlt, setTheAlt] = React.useState<string | undefined>(
        "Sample image"
    );

    const [theBackgroundColor, setTheBackgroundColor] = React.useState<
        string | undefined
    >("pink");

    const [theBorderColor, setTheBorderColor] = React.useState<
        string | undefined
    >("pink");

    const [theBorderRadius, setTheBorderRadius] = React.useState<
        string | number | undefined
    >(50);

    interface MyObj {
        src: string | undefined;
        width: string | number | undefined;
        height: string | number | undefined;
        border: string | 0 | undefined;
        loading: "eager" | "lazy" | undefined;
        maximizeFrame: boolean | undefined;
        shouldStartVisible: boolean | undefined;
        shouldFadeIn: boolean | undefined;
        alt: string | undefined;
        backgroundColor: string | undefined;
        borderColor: string | undefined;
        borderRadius: string | number | undefined;
    }

    const jsonOnChange = React.useCallback((value: string) => {
        const obj: MyObj = JSON.parse(value);

        setTheSrc(obj.src);
        setTheWidth(obj.width);
        setTheHeight(obj.height);
        setTheBorder(obj.border);
        setTheLoading(obj.loading);
        setTheMaximizeFrame(obj.maximizeFrame);
        setTheShouldStartVisible(obj.shouldStartVisible);
        setTheShouldFadeIn(obj.shouldFadeIn);
        setTheAlt(obj.alt);

        setTheBackgroundColor(obj.backgroundColor);
        setTheBorderColor(obj.borderColor);
        setTheBorderRadius(obj.borderRadius);
    }, []);

    return (
        <DemoPane title="Gallery Application">
            <div style={{ display: "flex", justifyContent: "center" }}>
                <Image
                    {...imageProps}
                    src={theSrc}
                    width={theWidth}
                    height={theHeight}
                    loading={theLoading}
                    maximizeFrame={theMaximizeFrame}
                    shouldStartVisible={theShouldStartVisible}
                    shouldFadeIn={theShouldFadeIn}
                    alt={theAlt}
                />
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: HeightAndWidth()[0] / 3, //500
                    whiteSpace: "pre",
                }}
            >
                <MonacoEditor
                    value={
                        '{\n"src": "http://via.placeholder.com/350x150",\n"width": 100,\n"height": 100,\n"border": "10px solid ",\n"backgroundColor": "pink",\n"borderColor": "pink",\n"borderRadius": 50,\n"loading": "lazy",\n"maximizeFrame": true,\n"shouldStartVisible": true,\n"shouldFadeIn": true,\n"alt": "Sample Image"\n}'
                    }
                    onChange={jsonOnChange}
                    onChangeDelay={20}
                    language="json"
                    containerStyle={{
                        width: "80%",
                        height: "100%",
                    }}
                    editorOptions={{
                        minimap: {
                            enabled: false,
                        },
                    }}
                />
            </div>
        </DemoPane>
    );
};

/* Create URLs for all of the images
img 1


img 2


img 3


img 4


img 5


img 6


img 7


img 8


*/
