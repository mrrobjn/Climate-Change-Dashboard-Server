import express from "express";
import cors from "cors";
import { route } from "./routers/index.js";

const app = express();
const PORT = 5000;
app.use(cors());

route(app);
// PythonShell.run("test2.py", options).then((results) => {
//   console.log(+results[0]);
// });
app.listen(PORT);