import { PythonShell } from "python-shell";
import { options } from "../config/pythonConfig.js";
export const LIDACSV = (req,res)=>{
      PythonShell.run('test3.py', options).then(results=>{
        res.json(results[0]);
      });
}

