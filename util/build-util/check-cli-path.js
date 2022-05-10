require("which")("butil").catch((err) => {
    if (err) {
        console.warn(
            "butil not found in path. Run `npm run dev-setup` " +
                "from the root directory to install it."
        );
    }
});
