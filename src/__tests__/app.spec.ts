/* eslint-disable import/no-extraneous-dependencies */
import axios from "axios";
import request from "supertest";
import { app } from "../app";

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

    const forwardRequestUrl =
      "https://example.com/api/endpoint?testParams=true";
    const forwardRequestHeaders = JSON.stringify({
      "content-type": "application/json",
      test: "test request header"
    });

    const params = { testParam: "123" };
    const payload = { name: "john", age: 30 };

    (axios.request as jest.Mock).mockResolvedValue(mockResponse);

    const response = await request(app)
      .put("/")
      .query({ forwardRequestUrl, forwardRequestHeaders, ...params })
      .send(payload);

    expect(axios.request).toHaveBeenCalledWith({
      url: forwardRequestUrl,
      method: "PUT",
      headers: JSON.parse(forwardRequestHeaders),
      params,
      data: payload
    });

    expect(response.status).toEqual(mockResponse.status);
    expect(response.headers).toEqual(
      expect.objectContaining({
        ...mockResponse.headers,
        "content-type": expect.stringContaining(
          mockResponse.headers["content-type"]
        )
      })
    );
    expect(response.body).toEqual(mockResponse.data);
  });

  it("should forward a request with FORM data", async () => {
    // Mock the response from the forward request
    const mockResponse = {
      data: { success: true },
      status: 200,
      headers: { "content-type": "application/json" }
    };

    const forwardRequestUrl =
      "https://example.com/api/endpoint?testParams=true";
    const forwardRequestHeaders = JSON.stringify({
      "content-type": "application/x-www-form-urlencoded",
      test: "test request header"
    });
    const payload = "name=John&age=30";

    (axios.request as jest.Mock).mockResolvedValue(mockResponse);

    // Send a POST request to the app
    const response = await request(app)
      .post("/")
      .query({
        forwardRequestUrl,
        forwardRequestHeaders
      })
      .send(payload);

    // Ensure the app made the correct forward request
    expect(axios.request).toHaveBeenCalledWith({
      url: forwardRequestUrl,
      method: "POST",
      headers: JSON.parse(forwardRequestHeaders),
      data: payload,
      params: {}
    });

    // Ensure the app returned the correct response to the client
    expect(response.status).toEqual(mockResponse.status);
    expect(response.headers).toEqual(
      expect.objectContaining({
        ...mockResponse.headers,
        "content-type": expect.stringContaining(
          mockResponse.headers["content-type"]
        )
      })
    );
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

    const forwardRequestUrl =
      "https://example.com/api/endpoint?testParams=true";
    const forwardRequestHeaders = JSON.stringify({
      "content-type": "application/x-www-form-urlencoded",
      test: "test request header"
    });
    const payload = "name=John&age=30";

    (axios.request as jest.Mock).mockRejectedValue(mockResponse);

    // Send a request to the app
    const response = await request(app)
      .post("/")
      .query({
        forwardRequestUrl,
        forwardRequestHeaders
      })
      .send(payload);

    // Ensure the app made the correct forward request
    expect(axios.request).toHaveBeenCalledWith({
      url: forwardRequestUrl,
      method: "POST",
      headers: JSON.parse(forwardRequestHeaders),
      data: payload,
      params: {}
    });

    // Ensure the app returned the correct response to the client
    expect(response.status).toEqual(mockResponse.response.status);
    expect(response.headers).toEqual(
      expect.objectContaining({
        ...mockResponse.response.headers,
        "content-type": expect.stringContaining(
          mockResponse.response.headers["content-type"]
        )
      })
    );
    expect(response.body).toEqual(mockResponse.response.data);
  });
});
