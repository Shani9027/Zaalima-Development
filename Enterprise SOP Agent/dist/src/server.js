"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const port = Number(process.env.PORT ?? 3000);
const app = (0, app_1.createApp)();
app.listen(port, () => {
    console.log(`OpsMind AI API listening on port ${port}`);
});
