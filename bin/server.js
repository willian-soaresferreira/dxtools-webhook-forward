"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const port = 3546;
app_1.app.listen(port, () => {
    console.log("\x1b[32m".concat("dxtools-webhook-forward", "\x1b[0m"), "app is running! \n");
});
