"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable import/no-extraneous-dependencies */
const axios_1 = __importDefault(require("axios"));
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../app");
jest.mock("axios");
describe("express app", () => {
    it("should forward a request with JSON data", async () => {
        const mockResponse = {
            data: { success: true },
            status: 200,
            headers: {
                "content-type": "application/json",
                test: "test response header"
            }
        };
        const forwardRequestUrl = "https://example.com/api/endpoint?testParams=true";
        const forwardRequestHeaders = JSON.stringify({
            "content-type": "application/json",
            test: "test request header"
        });
        const params = { testParam: "123" };
        const payload = { name: "john", age: 30 };
        axios_1.default.request.mockResolvedValue(mockResponse);
        const response = await (0, supertest_1.default)(app_1.app)
            .put("/")
            .query(Object.assign({ forwardRequestUrl, forwardRequestHeaders }, params))
            .send(payload);
        expect(axios_1.default.request).toHaveBeenCalledWith({
            url: forwardRequestUrl,
            method: "PUT",
            headers: JSON.parse(forwardRequestHeaders),
            params,
            data: payload
        });
        expect(response.status).toEqual(mockResponse.status);
        expect(response.headers).toEqual(expect.objectContaining(Object.assign(Object.assign({}, mockResponse.headers), { "content-type": expect.stringContaining(mockResponse.headers["content-type"]) })));
        expect(response.body).toEqual(mockResponse.data);
    });
    it("should forward a request with FORM data", async () => {
        // Mock the response from the forward request
        const mockResponse = {
            data: { success: true },
            status: 200,
            headers: { "content-type": "application/json" }
        };
        const forwardRequestUrl = "https://example.com/api/endpoint?testParams=true";
        const forwardRequestHeaders = JSON.stringify({
            "content-type": "application/x-www-form-urlencoded",
            test: "test request header"
        });
        const payload = "name=John&age=30";
        axios_1.default.request.mockResolvedValue(mockResponse);
        // Send a POST request to the app
        const response = await (0, supertest_1.default)(app_1.app)
            .post("/")
            .query({
            forwardRequestUrl,
            forwardRequestHeaders
        })
            .send(payload);
        // Ensure the app made the correct forward request
        expect(axios_1.default.request).toHaveBeenCalledWith({
            url: forwardRequestUrl,
            method: "POST",
            headers: JSON.parse(forwardRequestHeaders),
            data: payload,
            params: {}
        });
        // Ensure the app returned the correct response to the client
        expect(response.status).toEqual(mockResponse.status);
        expect(response.headers).toEqual(expect.objectContaining(Object.assign(Object.assign({}, mockResponse.headers), { "content-type": expect.stringContaining(mockResponse.headers["content-type"]) })));
        expect(response.body).toEqual(mockResponse.data);
    });
    it("should handle errors properly", async () => {
        // Mock the response from the forward request
        const mockResponse = {
            response: {
                data: { success: false },
                status: 500,
                headers: { "content-type": "application/json" }
            }
        };
        const forwardRequestUrl = "https://example.com/api/endpoint?testParams=true";
        const forwardRequestHeaders = JSON.stringify({
            "content-type": "application/x-www-form-urlencoded",
            test: "test request header"
        });
        const payload = "name=John&age=30";
        axios_1.default.request.mockRejectedValue(mockResponse);
        // Send a request to the app
        const response = await (0, supertest_1.default)(app_1.app)
            .post("/")
            .query({
            forwardRequestUrl,
            forwardRequestHeaders
        })
            .send(payload);
        // Ensure the app made the correct forward request
        expect(axios_1.default.request).toHaveBeenCalledWith({
            url: forwardRequestUrl,
            method: "POST",
            headers: JSON.parse(forwardRequestHeaders),
            data: payload,
            params: {}
        });
        // Ensure the app returned the correct response to the client
        expect(response.status).toEqual(mockResponse.response.status);
        expect(response.headers).toEqual(expect.objectContaining(Object.assign(Object.assign({}, mockResponse.response.headers), { "content-type": expect.stringContaining(mockResponse.response.headers["content-type"]) })));
        expect(response.body).toEqual(mockResponse.response.data);
    });
});
