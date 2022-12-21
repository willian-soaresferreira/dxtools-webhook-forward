import { app } from "./app";

const port = 3546;

app.listen(port, () => {
  const appName = "dxtools-webhook-forward";
  const webpageName = "dxtools.dev";

  const coloredAppName = "\x1b[32m".concat(appName, "\x1b[0m");
  const coloredWebpageName = "\x1b[32m".concat(webpageName, "\x1b[0m");

  console.log(`${coloredAppName} app is running!\n`);
  console.log(
    `keep the ${coloredWebpageName} web page open to start forwarding the webhook events. \n`
  );
});
