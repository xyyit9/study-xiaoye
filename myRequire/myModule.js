// var file = myRequire("./myFile.js");
var {hello} =myRequire("./myFile.js")

module.exports = {
  say: function (argv) {
    console.log("say:" + argv);
  },
  hi: hello,
};
