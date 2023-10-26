import path from "path";
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export let options = {
    mode: "text",
    scriptPath: path.resolve(__dirname, "..", "scripts"),
    pythonOptions: ["-u"], // get print results in real-time
    args:["C:\\Users\\USER\\Desktop\\archive.csv"]
  };