const urls = {
    main: {
        dev: "http://localhost:3178/index.html",
        prod: `file://${__dirname}/../../build/index.html`,
    },
    splash: {
        dev: `file://${__dirname}/../../client/splash-screen/splash-screen.html`,
        prod: `file://${__dirname}/../../build/client/splash-screen/splash-screen.html`,
    },
};

export const Constants = {
    urls,
};
