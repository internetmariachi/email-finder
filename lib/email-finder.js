var swig = require("swig");
var async = require("async");
var template = swig.compileFile(__dirname + "/emails.txt");
var emailExistence = require("email-existence");
const { last } = require("swig/lib/filters");

function processParams({ first_name, last_name, domain }) {
  if (!first_name && !last_name) {
    console.log(
      "Please provide the full name of the person surrounded by quotation marks."
    );
    return Promise.reject();
  } else if (!domain) {
    console.log("Please provide the company's domain");
    return Promise.reject();
  } else {
    if (!last_name) {
      console.error("You must provide a full name please %s", first_name);
      return Promise.reject();
    } else {
      var first_nameArr = first_name.toLowerCase().split(" ");
      var last_nameArr = last_name.toLowerCase().split(" ");

      var firstname = first_nameArr[0];
      var middlename = first_nameArr[1] || "";
      var lastname = last_nameArr[0];
      var secondlastname = last_name[3] || "";
      return createEmailsList(
        domain,
        firstname,
        lastname,
        middlename,
        secondlastname
      );
    }
  }
}

function createEmailsList(
  domain,
  firstname,
  lastname,
  middlename = "",
  secondlastname = ""
) {
  var fi = firstname.charAt(0);
  var li = lastname.charAt(0);
  var firstmn = middlename.charAt(0);
  var firstsl = secondlastname.charAt(0);

  var output = template({
    li: li,
    fi: fi,
    fn: firstname,
    ln: lastname,
    mn: middlename,
    sl: secondlastname,
    firstmn,
    firstsl,
    domain: domain,
  });

  var emailsArr = output.split("\n");

  return new Promise(function (resolve, reject) {
    var q = async.queue(function (email, callback) {
      console.log("Testing %s...", email);

      emailExistence.check(email, function (err, res) {
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

    emailsArr.forEach(function (email) {
      q.push(email, function (err) {});
    });

    q.drain = function () {
      console.log("Not found: ", JSON.stringify(domain, firstname, lastname));
      reject();
    };
  });
}

module.exports = processParams;
