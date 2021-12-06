
var swig  = require('swig');
var async = require('async');
var emailExistence = require('email-existence');

function processParams(program){

  if (!program.email) {
    console.log('Please provide the email.');
    return Promise.reject();
  }
  else {
    return checkEmail(program.email)
  }
}

function checkEmail(email){
  
  return new Promise(function(resolve, reject) {

    var q = async.queue(function (email, callback) {

      console.log('Testing %s...', email)

       emailExistence.check(email, function(err, res) {

        if (err) {
          return callback();
        }

         if (res) {
           console.log("%s is a valid email address", email);

          // Kill the queue
          q.kill();
          return resolve(email);
         }

        callback();
      });

    }, 2);

    q.drain = function() {
      console.log('Not found: ', JSON.stringify(email));
      reject();
    }
  });
}

module.exports = processParams;
