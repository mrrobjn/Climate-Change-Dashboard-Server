import { PythonShell } from "python-shell";
import { pythonConfig } from "../config/pythonConfig.js";
import { convertGoalToArr } from "../utils/convertGoal.js";
export const LIDACSV = (req,res)=>{
      PythonShell.run('Lida_scripts.py', pythonConfig()).then(results=>{
        // res.json(results);
        res.json(results[0]);
      });
}

