import express from "express";
import cors from "cors";
import { route } from "./routers/index.js";

const app = express();
const PORT = 5000;

app.use(cors());

route(app);

app.listen(PORT);
