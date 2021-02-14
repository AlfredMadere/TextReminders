

function waitUntil(condition, timeout) {
    let timeLimit = timeout ? Date.now() + timeout : null;
    return new Promise(function (resolve, reject) {
        (function waitForCondition(){
            if (condition()) return resolve(true);
            //console.log('waiting for condition');
            if(timeLimit && Date.now() > timeLimit) return reject(new Error('timeout'));
            setTimeout(waitForCondition, 30);
        })();
    });
};

//exports.default = waitUntil;
export default waitUntil; 