/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var React = require('react');
var objectAssign = require('object-assign');
var contextTypes = require('../lib/contextTypes');

/**
 * Registers change listeners and retrieves state from stores using `getStateFromStores`
 * method. Concept provided by Dan Abramov via
 * https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750
 * @method connectToStores
 * @param {React.Component} Component component to pass state as props to
 * @param {array} stores List of stores to listen for changes
 * @param {object} storeGetters Map of storeName => stateGetterMethod used to retrieve state from the store
 * @returns {React.Component}
 */
module.exports = function connectToStores(Component, stores, storeGetters) {
    var componentName = Component.displayName || Component.name;
    var StoreConnector = React.createClass({
        displayName: componentName + 'StoreConnector',
        contextTypes: {
            getStore: contextTypes.getStore
        },
        getInitialState: function getInitialState() {
            return this.getStateFromStores(this.props);
        },
        componentDidMount: function componentDidMount() {
            stores.forEach(function storesEach(Store) {
                this.context.getStore(Store).addChangeListener(this._onStoreChange);
            }, this);
        },
        componentWillUnmount: function componentWillUnmount() {
            stores.forEach(function storesEach(Store) {
                this.context.getStore(Store).removeChangeListener(this._onStoreChange);
            }, this);
        },
        getStateFromStores: function () {
            var state = {};
            Object.keys(storeGetters).forEach(function (storeName) {
                var stateGetter = storeGetters[storeName];
                var store = this.context.getStore(storeName);
                objectAssign(state, stateGetter(store, this.props));
            }, this);
            return state;
        },
        _onStoreChange: function onStoreChange() {
            this.setState(this.getStateFromStores());
        },
        render: function render() {
            return React.createElement(Component, objectAssign({}, this.props, this.state));
        }
    });

    return StoreConnector
};
