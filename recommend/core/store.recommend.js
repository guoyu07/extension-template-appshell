/**
 * @file store
 * @author wangyisheng(wangyisheng@baidu.com)
 */

// borrow from nuxt.js
// https://github.com/nuxt/nuxt.js/blob/dev/lib/app/store.js

'use strict';

import Vue from 'vue';
import Vuex from 'vuex';
/* ======== lavas extensions start ======== */
// 增加引用appshell提供的module
import {createAppShellState} from 'extensions/appshell/store/module';
/* ======== lavas extensions end ======== */

Vue.use(Vuex);

// find all files in {srcDir}/store
const files = require.context('@/store', true, /^\.\/.*\.js$/);
const filenames = files.keys();

/**
 * store data
 *
 * @type {Object}
 */
let storeData = {};

// find index file
for (let filename of filenames) {
    if (filename === './index.js') {
        // get index file
        storeData = getModule(filename);
        break;
    }
}

// if storeData is not a function, then require all other files, and add then to storeData
if (typeof storeData !== 'function') {
    storeData.modules = storeData.modules || {};

    for (let filename of filenames) {
        if (filename === './index.js') {
            continue;
        }

        let name = filename.replace(/^\.\//, '').replace(/\.js$/, '');
        let paths = name.split('/');
        let module = getModuleNamespace(storeData, paths);

        name = paths.pop();
        module[name] = getModule(filename);
        console.log(module[name]);
        module[name].namespaced = true;
    }
}

// export createStore
export const createStore = storeData instanceof Function
    ? storeData
    : () => new Vuex.Store(Object.assign({}, storeData, {
        /* ======== lavas extensions start ======== */
        // 将appshell的modules添加到vuex中。第一行末尾加逗号
        state: storeData.state instanceof Function ? storeData.state() : {},
        modules: {
            appshell: createAppShellState()
        }
        /* ======== lavas extensions end ======== */
    }));

/**
 * get module by file name
 * this module or state must be a function which returns a Vuex instance of fresh state instance
 *
 * @param {string} filename filename
 * @return {*}
 */
function getModule(filename) {
    const file = files(filename);
    const module = file.default || file;

    if (module.commit) {
        throw new Error(
            '[lavas] store/' + filename.replace('./', '') + ' should export a method which returns a Vuex instance.'
        );
    }

    if (module.state && typeof module.state !== 'function') {
        throw new Error(
            '[lavas] state should be a function in store/' + filename.replace('./', '')
        );
    }

    return module;
}

/**
 * get module namespace
 *
 * @param {Object} storeData store
 * @param {Array.<string>} paths path
 * @return {Object}
 */
function getModuleNamespace(storeData, paths) {
    if (paths.length === 1) {
        return storeData.modules;
    }

    let namespace = paths.shift();

    let nsModule = storeData.modules[namespace] = storeData.modules[namespace] || {};
    nsModule.namespaced = true;
    nsModule.modules = nsModule.modules || {};

    return getModuleNamespace(nsModule, paths);
}
