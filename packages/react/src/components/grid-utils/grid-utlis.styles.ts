export const Footer = {
    height: "32px",
    width: "100%",
    paddingTop: "3px",
    marginLeft: "10px",
    color: "#333",
    borderTop: "1px solid #edebe9",

    "&:span": {
        fontWeight: "400",
        color: "rgb(50, 49, 48)",
    },
    "&:div": {
        fontWeight: "400",
        color: "rgb(50, 49, 48)",
    },
};

export const FooterRight = {
    alignSelf: "flex-end",
    marginRight: "10px",
};

export const FooterIcon = {
    backgroundColor: "transparent",

    "&:i": {},
    "&:span": {
        color: "#0078D4",
    },
    "&:span:disabled": {
        color: "gray",
    },
};
