import axios from "axios";
import express from "express";
import cors from "cors";
import { format } from "date-fns";

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: ["https://www.dxtools.dev"] }));

app.all("/*", async (req, res) => {
  const logRequestInfoToTerminal = (responseStatus: string) => {
    const logDate = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    const coloredLogDate = `\x1b[90m[${logDate}]\x1b[0m`;
    const coloredLogStatus = `\x1b[96m${responseStatus}\x1b[0m`;

    console.log(
      `${coloredLogDate} New webhook event. Response status: ${coloredLogStatus}`
    );
  };

  const { method, query: queryParams, body } = req;
  const { forwardRequestBody } = body;
  const { forwardRequestUrl, forwardRequestHeaders } = queryParams;
  const headers = JSON.parse(forwardRequestHeaders as string);

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
      data: forwardRequestBody
    })
    .catch(err => ({
      status: err.response?.status || 500,
      headers: err.response?.headers ? err.response.headers : undefined,
      data: err.response?.data || { error: err.message || err }
    }));

  const responseBody =
    typeof forwardResponse.data !== "object"
      ? String(forwardResponse.data)
      : forwardResponse.data;

  logRequestInfoToTerminal(forwardResponse.status);

  return res
    .status(forwardResponse.status)
    .header(forwardResponse.headers)
    .send(responseBody);
});

export { app };
