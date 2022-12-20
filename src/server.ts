import { app } from "./app";

const port = 3546;

app.listen(port, () => {
  console.log(
    "\x1b[32m".concat("dxtools-webhook-forward", "\x1b[0m"),
    "app is running! \n"
  );
});
