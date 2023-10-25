import { PythonShell } from "python-shell";

const LIDACSV = ()=>{
    let options = {
        mode: 'text',
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: '/path/to/your/python/script', // update this to the path of your LIDA script
        args: ['/path/to/your/csv/file'] // pass the CSV file path as an argument
      };
      
      PythonShell.run('lida_script.py', options, function (err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution
        console.log('results:', results);
      });
}

