import axios from "axios";
import express from "express";
import cors from "cors";
import dateFns from "date-fns";

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
  const headers = JSON.parse(forwardRequestHeaders as string);

  const formData = new URLSearchParams();

  if (headers["content-type"] === "application/x-www-form-urlencoded") {
    Object.keys(body).forEach(key => {
      formData.append(key, body[key]);
    });
  }

  const paramsArray = Object.entries(queryParams);
  const filteredParams = Object.fromEntries(
    paramsArray.filter(
      ([key]) => !key.match(/^(forwardRequestUrl|forwardRequestHeaders)$/)
    )
  );

  const forwardResponse = await axios
    .request({
      url: (forwardRequestUrl as string).replace("/staging", ""), // TODO: remove this replace,
      method,
      headers,
      params: filteredParams,
      data: formData.toString() ? formData : body
    })
    .catch(err => ({
      status: err.response?.status || 500,
      headers: err.response?.headers ? err.response.headers : undefined,
      data: err.response?.data || { error: err.message || err }
    }));

  console.log(
    `\x1b[90m[${dateFns.format(new Date(), "yyyy-MM-dd HH:mm:ss")}]\x1b[0m`,
    "New webhook event. Response status:",
    `\x1b[96m${forwardResponse.status}\x1b[0m`
  );

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
  console.log(
    "\x1b[32m".concat("dxtools-webhook-forward", "\x1b[0m"),
    "app is running! \n"
  );
});

export default app;
