// @flow

import { createStore, combineReducers, applyMiddleware } from 'redux'
import { persistStore, persistReducer } from './redux-persist'
import createSagaMiddleware from 'redux-saga'
import { fork, all } from 'redux-saga/effects'

import AsyncBrowserExtensionStorage from './storage'
import filesTransform from './filesTransform.js'

import browserAction from './browser-action'
import core from './core'
import counter, { sagas as counterSagas } from './counter'
import elements from 'cmn/lib/comm/redux/elements'
import extensions, { sagas as extensionsSagas } from './extensions'
import files from './files'

import type { Shape as CoreShape } from './core'
import type { Shape as CounterShape } from './counter'
import type { Shape as BrowserActionShape } from './browser-action'
import type { Shape as ElementsShape } from 'cmn/src/comm/redux/elements'
import type { Shape as FilesShape } from './files'
import type { Shape as ExtensionsShape } from './extensions'

export type Shape = {
    _persist: { version:number, rehydrated:boolean },
    browserAction: BrowserActionShape,
    core: CoreShape,
    counter: CounterShape,
    elements: ElementsShape,
    extensions: ExtensionsShape,
    files: FilesShape
}

console.log('process.env.NODE_ENV:', process.env.NODE_ENV, process.env.NODE_ENV !== 'production');
export const storage = new AsyncBrowserExtensionStorage();
const persistConfig = {
    key: 'primary',
    debug: process.env.NODE_ENV !== 'production',
    whitelist: ['counter', 'files', 'extensions'],
    storage,
    transforms: [ filesTransform ]
}

const sagaMiddleware = createSagaMiddleware();
const reducers = persistReducer(persistConfig, combineReducers({ browserAction, core, counter, elements, extensions, files }));
const sagas = [ ...counterSagas, ...extensionsSagas ];

const store = createStore(reducers, applyMiddleware(sagaMiddleware));

export const persistor = persistStore(store);
function* rootSaga() {
    yield all(sagas.map(saga => fork(saga)));
}
sagaMiddleware.run(rootSaga);

// store.subscribe(function() {
//     console.log('store updated:', store.getState());
// })

export default store
