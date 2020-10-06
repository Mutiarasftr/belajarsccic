const fs = require('fs');
const fs_extra = require('fs-extra');

let {PythonShell} = require('python-shell')

var options = {
    mode: 'text',
    pythonPath: '/home/hadoop/.virtualenvs/dl/bin/python',
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: '/home/hadoop/Downloads/Compressed/Pengenalan_muka/',
  };

function ensureExists(path, mask, cb) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
            else cb(err); // something else went wrong
        } else cb(null); // successfully created folder
    });
}

function makeAlign(){
    PythonShell.run('Make_aligndata.py', options, function (err, results) {
        if (err) 
          throw err;
        // Results is an array consisting of messages collected during execution
        console.log('results: %j', results);
    });
}

function makeClassifier(){
    PythonShell.run('Make_classifier_new.py', options, function (err, results) {
        if (err) 
          throw err;
        // Results is an array consisting of messages collected during execution
        console.log('results: %j', results);
    });
}

exports.createDir = async (req, res, next) => {
    let approot = process.cwd();
    try {
        let filename = req.body.name;
        ensureExists(`/home/hadoop/Downloads/Compressed/Pengenalan_muka/train_img/${filename}`, 0744, function(err) {
            if (err){
                console.log(err)
            }else{
                fs_extra.copy(`${approot}/public/images/face-enrollment/${req.file.filename}`, `/home/hadoop/Downloads/Compressed/Pengenalan_muka/train_img/${filename}/${req.file.filename}`, err => {
                    if (err) return console.error(err)
                    console.log('success!');

                    //makeAlign();
                    //setTimeout(makeClassifier, 10000);
                });
                next();
            } 
                
        });
    } catch (error) {
        next(error);
    }

}