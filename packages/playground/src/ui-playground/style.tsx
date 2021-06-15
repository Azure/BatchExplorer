// For any functions related to styling the look of the playground

/*
 * Style for icons on the left-hand side of the playground page
 */
export const linkStyle = {
    padding: 18,
    margin: 10,
    marginLeft: window.innerWidth / 25,
    marginBottom: 10, //margin below each element
    marginRight: 10,
    fontSize: "1.5em",
};

/*
 * Style for the three main headings on the left-hand side of the playground page
 */
export const categoryStyle = {
    fontSize: "2em",
    marginLeft: window.innerWidth / 50,
};

export const HEADER_HEIGHT = "48px";

/*
 * Style for each component's title
 */
export const headingStyle = {
    fontSize: "1.5em",
    margin: 0,
    padding: 0,
    fontWeight: 600,
    lineHeight: HEADER_HEIGHT,
    textAlign: "center" as const,
    userSelect: "none" as const,
};

export const iconDropdownStyle = {
    //margin: 10,
    fontSize: "1.3em",
    textAlign: "center" as const,
};
