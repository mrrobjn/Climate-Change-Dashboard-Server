import { PythonShell } from "python-shell";
import { pythonConfig } from "../../config/pythonConfig.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import dotenv from "dotenv";
import isBase64 from "../../utils/isBase64.js";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const api_key = process.env.COHERE_API_KEY;

export const uploadData = (req, res) => {
  try {
    let data = path.join(__dirname, "../../..", req.file.path);
    PythonShell.run("Lida_scripts.py", pythonConfig([data, api_key]))
      .then((results) => {
        res.json({
          summary: JSON.parse(results[0]),
          goals: JSON.parse(results[1]),
          path: data,
        });
      })
      .catch((error) => {
        res.status(400).json({ message: "Invalid file format", error });
      });
  } catch (error) {
    res.json(error);
  }
};
export const postSingleGoal = (req, res) => {
  try {
    const { path, goal } = req.body;
    PythonShell.run("single_goal.py", pythonConfig([path, goal, api_key])).then(
      (results) => {
        let parsedGoal;
        try {
          parsedGoal = JSON.parse(results[1]);
          const { question, rationale, visualization } = parsedGoal;
          res.json({ base64: results[0], question, rationale, visualization });
        } catch (error) {
          return res
            .status(400)
            .json({
              message: "Invalid Goal format",
              goal: results[1],
              base64: results[0],
            });
        }
      }
    );
  } catch (error) {
    res.json(error);
  }
};

export const modifyGoal = (req, res) => {
  try {
    const { path, goal, instruction } = req.body;
    PythonShell.run(
      "goal_modify.py",
      pythonConfig([path, goal, instruction, api_key])
    ).then((results) => {
      if (isBase64(results[0])) {
        res.json(results[0]);
      } else {
        res.status(400).json({ message: "Something wrong, please try again" });
      }
    });
  } catch (error) {
    res.json(error);
  }
};
