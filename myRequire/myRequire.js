https://www.cnblogs.com/nordon-wang/p/6051630.html
var path = require("path");
var fs = require("fs");
function myRequire(id) {
  var filepath = path.resolve(__dirname, id);
  var dirname = path.dirname(filepath);
  var code = fs.readFileSync(filepath, "utf-8");
  var module = { id: filepath, export: {} };
  var exports = module.export;
  code = `(function(myRequire, module, exports, __dirname, __filepath ){
      ${code}
    })(myRequire, module, exports, dirname, filepath)`;
  eval(code);
  return module.exports || exports
}

var obj = myRequire('./myModule.js')
obj.say('say');
obj.hi('hello');
