import express from "express";
import cors from "cors";
import { route } from "./routers/index.js";
import bodyParser from "body-parser";

import {connect } from './config/db/index.js';

connect();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.json());

const PORT = 5000;

app.use(cors());

route(app);

app.listen(PORT);