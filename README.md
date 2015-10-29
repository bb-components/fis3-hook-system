# fis3-hook-system

fis3 已经默认不自带模块化开发支持，那么如果需要采用 System.js 规范作为模块化开发，请使用此插件。

请配合 system.js 一起使用。

注意：需要对目标文件设置 `isMod` 属性，说明这些文件是模块化代码。


```js
fis.match('/modules/**.js', {
  isMod: true
})
``` 

只有标记是模块化的 js 才会去解析。

## 安装

全局安装或者本地安装都可以。

```
npm install -g fis3-hook-system
```

或者

```
npm install fis3-hook-system
```

## 用法

在 fis-conf.js 中加入以下代码。


```js
fis.hook('system', {
  // 配置项
});
```

## 配置项

* `baseUrl` 默认为 `.` 即项目根目录。用来配置模块查找根目录。
* `paths` 用来设置别名，路径基于 `baseUrl` 设置。
  
  ```js
  fis.hook('system', {
    paths: {
      $: '/modules/jquery/jquery-1.11.2.js'
    }
  });
  ```
* `packages` 用来配置包信息，方便项目中引用。
  
  ```js
  fis.hook('system', {
    packages: [
      {
        name: 'foo',
        location: './modules/foo',
        main: 'index.js'
      }
    ]
  });
  ```

  * 当 `require('foo')` 的时候等价于 `require('/modules/foo/index.js')`.
  * 当 `require('foo/a.js')` 的时候，等价于 `require('/modules/foo/a.js')`.
* `shim` 可以达到不改目标文件，指定其依赖和暴露内容的效果。**注意只对不满足amd的js有效**
  
  ```js
  fis.hook('system', {
      shim: {
          'comp/2-0/2-0.js': {
              deps: ['jquery'],
              exports: 'myFunc'
          }
      }
  });
  ```
  
  * `key` 为目标文件
  * `value`
    * `deps` [可选] 依赖的 `module` 列表。
    * `exports` [可选] 暴露的对象名称。
    * `init` [可选] 暴露的可以通过自定的方法来控制。
    
      ```js
      fis.hook('cmd', {
          shim: {
              'comp/2-0/2-0.js': {
                  deps: ['jquery'],
                  init: 'function($) {return $.extend({a: 1}, {b: 2})}'
              }
          }
      });
      ```
* `extList` 默认为 `['.js', '.coffee', '.jsx', '.es6']`，当引用模块时没有指定后缀，该插件会尝试这些后缀。
* `tab` 默认为 `2`, 用来设置包裹时，内容缩进的空格数。
