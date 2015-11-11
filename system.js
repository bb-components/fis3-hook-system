var amd = require('fis3-hook-amd/amd.js');
var lang = fis.compile.lang;
var rRequire = /"(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|(\/\/[^\r\n\f]+|\/\*[\s\S]+?(?:\*\/|$))|\b(require[\s\r\n]*?\.async|require|System[\s\r\n]*?\.import)\s*\(\s*("(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|\[[\s\S]*?\])\s*/g;


var system = module.exports = function(info, conf) {
  var file = info.file;
  var shimed = conf.shim && conf.shim[file.subpath];
  var ignoreDependencies = conf.ignoreDependencies;
  var isIgnored = function(str) {
    var found = false;

    ignoreDependencies.every(function(item) {
      if (item && item.exec && item.exec(str)) {
        found = true;
        return false;
      }
      return true;
    });

    return found;
  };

  try {
    // 用户主动配置了 shim 那么说明目标文件一定是模块化 js
    shimed && (file.isMod = true);
    file.isMod && amd.apply(amd, arguments);
  } catch(e) {
    // I don't care.
  }

  if (file.skipDepsAnalysis) {
    return;
  }

  var content = info.content;

  info.content = content.replace(rRequire, function(m, comment, type, params) {
    if (type) {
      switch (type.replace(/[\s\r\n]+/g, '')) {
        case 'require.async':
          var info = parseParams(params);

          m = type + '([' + info.params.map(function(v) {
            if (isIgnored('/' + v.value)) {
              return r.raw;
            }

            return lang.jsAsync.wrap(v.raw);
          }).join(',') + ']';
          break;

        case 'System.import':
          var info = parseParams(params);
          var hasBrackets = info.hasBrackets;

          m = type + '(' + (hasBrackets ? '[' : '') + info.params.map(function(v) {
            if (isIgnored('/' + v.value)) {
              return r.raw;
            }

            return lang.jsAsync.wrap(v.raw);
            //return lang.info.wrap(lang.jsAsync.wrap(v)) + lang.uri.wrap(v);
          }).join(',') + (hasBrackets ? ']' : '');
          break;

        case 'require':
          var info = parseParams(params);
          var async = info.hasBrackets;

          m = 'require(' + (async ? '[' : '') + info.params.map(function(v) {
            if (isIgnored('/' + v.value)) {
              return v.raw;
            }

            return lang[async ? 'jsAsync' : 'jsRequire'].wrap(v.raw);
          }).join(',') + (async ? ']' : '');
          break;
      }
    }

    return m;
  });
};

function parseParams(value) {
  var hasBrackets = false;
  var params = [];

  value = value.trim().replace(/(^\[|\]$)/g, function(m, v) {
    if (v) {
      hasBrackets = true;
    }
    return '';
  });
  params = value.split(/\s*,\s*/).map(function(item) {
    return {
      raw: item,
      value: item.substring(1, item.length - 2)
    };
  });

  return {
    params: params,
    hasBrackets: hasBrackets
  };
}
