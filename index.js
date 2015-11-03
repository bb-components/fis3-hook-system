var lookup = require('fis3-hook-commonjs/lookup.js');
var system = require('./system.js');
// 程序入口
var entry = module.exports = function(fis, opts) {
  
  // amd 处理配置项。
  opts.forwardDeclaration = true;
  opts.skipBuiltinModules = false;

  lookup.init(fis, opts);

  // normalize shim
  // 规整 shim 配置。
  opts.shim && (function() {
    var shim = opts.shim;
    var normalized = {};

    Object.keys(shim).forEach(function(key) {
      var val = shim[key];

      if (Array.isArray(val)) {
        val = {
          deps: val
        }
      }

      var info = lookup(fis.util.query(key));
      if (!info.file) {
        return;
      }

      normalized[info.file.subpath] = val;
    });

    opts.shim = normalized;
  })();

  fis.on('lookup:file', lookup);
  fis.on('standard:js', function(info) {
    system(info, opts);
  });
};

entry.defaultOptions = {

  // 用来查找无后缀资源的
  extList: ['.js', '.coffee', '.jsx', '.es6', '.ts', '.tsx'],

  // 设置包裹时，内容缩进的空格数。
  tab: 2
};
