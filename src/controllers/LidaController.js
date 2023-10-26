import { PythonShell } from "python-shell";
import { options } from "../config/pythonConfig.js";
export const LIDACSV = (req,res)=>{
      PythonShell.run('Lida_scripts.py', options).then(results=>{
        res.json(results[0]);
      });
}

