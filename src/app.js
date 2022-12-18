const axios = require("axios");
const express = require("express");
const cors = require("cors");

const app = express();
const port = 3546;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "https://www.dxtools.dev",
      "https://development.d11q8tb9qqr2lc.amplifyapp.com",
      "http://127.0.0.1:5173"
    ]
  })
);

app.all("/*", async (req, res) => {
  const { method, query: queryParams, body } = req;
  const { forwardRequestUrl, forwardRequestHeaders } = queryParams;
  const headers = JSON.parse(forwardRequestHeaders);

  let formData = new URLSearchParams();

  if (headers["content-type"] === "application/x-www-form-urlencoded") {
    Object.keys(body).forEach((key) => {
      formData.append(key, body[key]);
    });
  }

  const forwardResponse = await axios
    .request({
      url: forwardRequestUrl.replace(`/staging`, ""), // TODO: remove this replace,
      method,
      headers,
      params: queryParams,
      data: formData.toString() ? formData : body
    })
    .catch((err) => ({
      status: err.response?.status || 500,
      headers: err.response?.headers ? err.response.headers : undefined,
      data: err.response?.data || { error: err.message || err }
    }));

  const responseBody =
    typeof forwardResponse.data !== "object"
      ? String(forwardResponse.data)
      : forwardResponse.data;

  return res
    .status(forwardResponse.status)
    .header(forwardResponse.headers)
    .send(responseBody);
});

app.listen(port, () => {
  console.log(`dxtools webhook forward app listening on port ${port}`);
});
