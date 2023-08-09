/*
 * Style for icons on the left-hand side of the playground page
 */
export const linkStyle: React.CSSProperties = {
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
export const categoryStyle: React.CSSProperties = {
    fontSize: "2em",
    marginLeft: window.innerWidth / 50,
};

export const HEADER_HEIGHT = "48px";

/*
 * Style for each component's title
 */
export const headingStyle: React.CSSProperties = {
    fontSize: "18px",
    margin: 0,
    padding: 0,
    fontWeight: 400,
    lineHeight: HEADER_HEIGHT,
    textAlign: "center",
    userSelect: "none",
};

export const iconDropdownStyle: React.CSSProperties = {
    //margin: 10,
    fontSize: "1.3em",
    textAlign: "center",
};
