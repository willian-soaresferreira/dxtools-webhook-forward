"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const axios_1 = __importDefault(require("axios"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const date_fns_1 = require("date-fns");
const app = (0, express_1.default)();
exports.app = app;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({ origin: ["https://www.dxtools.dev"] }));
app.all("/*", async (req, res) => {
    const logRequestInfoToTerminal = (responseStatus) => {
        const logDate = (0, date_fns_1.format)(new Date(), "yyyy-MM-dd HH:mm:ss");
        const coloredLogDate = `\x1b[90m[${logDate}]\x1b[0m`;
        const coloredLogStatus = `\x1b[96m${responseStatus}\x1b[0m`;
        console.log(`${coloredLogDate} New webhook event. Response status: ${coloredLogStatus}`);
    };
    const { method, query: queryParams, body } = req;
    const { forwardRequestUrl, forwardRequestHeaders } = queryParams;
    const headers = JSON.parse(forwardRequestHeaders);
    const formData = new URLSearchParams();
    if (headers["content-type"] === "application/x-www-form-urlencoded") {
        Object.keys(body).forEach(key => {
            formData.append(key, body[key]);
        });
    }
    const paramsArray = Object.entries(queryParams);
    const filteredParams = Object.fromEntries(paramsArray.filter(([key]) => !key.match(/^(forwardRequestUrl|forwardRequestHeaders)$/)));
    const forwardResponse = await axios_1.default
        .request({
        url: forwardRequestUrl.replace("/staging", ""),
        method,
        headers,
        params: filteredParams,
        data: formData.toString() || body
    })
        .catch(err => {
        var _a, _b, _c;
        return ({
            status: ((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) || 500,
            headers: ((_b = err.response) === null || _b === void 0 ? void 0 : _b.headers) ? err.response.headers : undefined,
            data: ((_c = err.response) === null || _c === void 0 ? void 0 : _c.data) || { error: err.message || err }
        });
    });
    const responseBody = typeof forwardResponse.data !== "object"
        ? String(forwardResponse.data)
        : forwardResponse.data;
    logRequestInfoToTerminal(forwardResponse.status);
    return res
        .status(forwardResponse.status)
        .header(forwardResponse.headers)
        .send(responseBody);
});
