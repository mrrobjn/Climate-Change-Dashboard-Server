import express from "express";
import cors from "cors";
import { route } from "./routers/index.js";
import { PythonShell } from "python-shell";

const app = express();
const PORT = 5000;

app.use(cors());
let options = {
  mode: "text",
  scriptPath: "C:/Climate-Change-Dashboard-Server/src/scripts",
  pythonOptions: ["-u"], // get print results in real-time
  args: ["value1", "value2", "value3"],
};
route(app);
PythonShell.run("test.py", options).then((results) => {
  // results is an array consisting of messages collected during execution
  console.log("results: %j", results);
});
app.listen(PORT);