import { PythonShell } from "python-shell";
import { pythonConfig } from "../config/pythonConfig.js";
import { convertGoals } from "../utils/convertGoal.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const uploadData = (req, res) => {
  try {
    let data = path.join(__dirname, "../..", req.file.path);
    PythonShell.run("Lida_scripts.py", pythonConfig([data])).then((results) => {
      res.json({
        summary: JSON.parse(results[0]),
        goals: JSON.parse(results[1]),
        path: data,
      });
    });
  } catch (error) {
    res.json(error);
  }
};
export const postSingleGoal = (req, res) => {
  try {
    const { path, goal } = req.body;
    PythonShell.run("single_goal.py", pythonConfig([path, goal])).then(
      (results) => {
        res.json(results[0]);
      }
    );
  } catch (error) {
    res.json(error);
  }
};
