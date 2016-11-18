import {createStore, combineReducers }from 'redux';
import * as reducers from './dashboard'

export default function () {
    var reducer = combineReducers(reducers)
    var store = createStore(reducer);
    console.log('inside store function for app.jsx')
    return store;
}