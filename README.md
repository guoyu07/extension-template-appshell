# 扩展

## 什么是扩展

Lavas 除了能够生成 PWA 项目（通过 `lavas init`）以外，还提供了“扩展”的机制允许开发者很方便的获取比较通用的新功能，节省时间成本并避免重复开发，类似于我们熟悉 nodejs 的包管理器 npm package

在 npm package 的生态环境中，开发者不单单是使用方，也可以是提供方。在这点上 Lavas 扩展也是相同的，开发者不单单可以使用别人写的扩展，也可以自己提供扩展，只要遵循一定的规则即可。

有关 Lavas 更多的信息可以参考官网 [https://lavas.baidu.com](https://lavas.baidu.com)，也欢迎加入 Lavas 开发的大家庭！

## appshell

这里要介绍的是目前 Lavas 内置的一个最常用的扩展： appshell，效果如图：

![appshell效果](http://boscdn.bpc.baidu.com/assets/lavas-extension-appshell/appshell.png)

简而言之，appshell 可以帮助开发者套上一层“壳”。除了在壳的界面上可以进行许多操作（侧滑菜单，顶部搜索按钮，底部导航等）之外，因为壳本身会被 service worker 缓存，因此在切换页面时壳能够很快展现，大大提升用户体验，这也是 PWA 的典型应用之一。关于 appshell 更多的信息可以参考[这里](https://lavas.baidu.com/guide/vue/doc/vue/advanced/define-app-shell)

## 安装方式

这里以 appshell 为例，介绍开发者如何快速把这个扩展安装到 Lavas 项目中。

我们回顾一下安装 npm package 一般需要两个步骤：

1. 运行命令 `npm install xxx` 安装扩展主体
2. 修改相关代码，添加  `import xxx from 'xxx'` 或者 `const xxx = require 'xxx';` 来完成引用

Lavas 安装扩展也需要执行这样两个步骤

### 安装扩展主体

`lavas install appshell`

或者简写：

`lavas i appshell`

执行效果如图：

![安装效果](http://boscdn.bpc.baidu.com/assets/lavas-extension-appshell/lavas-install.png)

扩展主体安装在 `extensions` 目录中。

### 修改引用代码

鉴于 Lavas 引用扩展较 npm 更为复杂，在执行 `lavas install appshell` 之后，Lavas 会自动提示还有哪些代码需要修改并给出修改建议，正如上图所示的 `xxx.recommend.js` 这样。

观察这些 recommend 文件，我们着重关注其中的 __lavas extensions start__ 和 __lavas extensions end__ 两个注释之间的部分，这就是需要开发者手动修改的部分。

我们以 `core/store.js` 举例。在安装扩展前，store.js 的 __片段__ 大概是这个样子：

```javascript
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export function createStore() {
    return new Vuex.Store({});
}
```

执行过安装命令后，与之平级会出现一个新的文件 store.recommend.js， 文件内容的 __片段__ 大概是：

```javascript
import Vue from 'vue';
import Vuex from 'vuex';
/* ======== lavas extensions start ======== */
import {createAppShellState} from 'extensions/appshell/store/module';
/* ======== lavas extensions end ======== */

Vue.use(Vuex);

export function createStore() {
    return new Vuex.Store({
        /* ======== lavas extensions start ======== */
        modules: {
            appshell: createAppShellState()
        }
        /* ======== lavas extensions end ======== */
    });
}
```

可以看到 recommend 文件中需要重点关注的有两处，作用为引用 appshell 提供的 module，并注入到项目本身的 vuex 中。在将这两处修改并保存到 store.js 之后，store.recommend.js __即可删除，不必保留__。

之所以采取这样的“半自动化”的安装方式，主要原因是相较于 npm 的一句 require/import ，Lavas 的引用方式更加复杂；而涉及修改的代码开发者可以自主改动，因此又无法实现通过安装命令直接修改开发者代码的做法，只能采取给开发者提供修改建议，由开发者手动修改这样的折中方案。

## 卸载方式

Lavas 除了给开发者提供快速安装的方法之外，也集成了命令完成其反向操作，即卸载插件。和安装类似，同样需要两个步骤。

### 卸载插件主体

`lavas uninstall appshell`

或者简写：

`lavas un appshell`

执行效果如图：

![卸载效果](http://boscdn.bpc.baidu.com/assets/lavas-extension-appshell/lavas-uninstall.png)

请注意：卸载扩展会删除 `extensions` 目录中对应的扩展目录，因此如果开发者有对它进行过任何改动也将 __一并删除__。

### 修改引用代码

本质上就是将安装时修改的代码再恢复原状，否则因为扩展主体已经删除，引用代码将抛出错误。为了防止开发者有所遗漏，Lavas 会指明哪些文件需要修改。

同时如果开发者没有删除在安装时引入的 recommend 文件，在卸载时也会一并删除。
