'use strict'

let _ = require('lodash')

module.exports = class MongooseModel {

  constructor(proton) {
    this.proton = proton
    this._schema = {}
    this.options = {}
    this.store = this.store()
    this._bindToApp()
    this.expose()
  }

  build(mongoose) {
    this.mongoose = mongoose
    return this._generateModel()
  }

  schema() {
    return new Error('You must implement the method schema')
  }

  expose() {
    global[this.name] = this
    return true
  }

  get name() {
    return this.constructor.name
  }

  store() {
    return this.proton.app.config.database.store
  }

  _generateModel() {
    return this.mongoose.model(this.name, this._buildSchema())
  }

  _buildSchema() {
    let prototype = this.constructor.prototype
    let constructor = this.constructor
    this._schema = new this.mongoose.Schema(this.schema(), {})
    this._createStaticMethods(constructor)
    this._createInstanceMethods(prototype)
    this._createVirtualMethods(prototype)
    return this._schema

  }

  _createInstanceMethods(o) {
    _.map(Object.getOwnPropertyNames(o), (name) => {
      let method = Object.getOwnPropertyDescriptor(o, name)
      if (this._isInstanceMethod(name, method)) {
        this._schema.method(name, method.value)
      }
    })
  }

  _createStaticMethods(o) {
    let properties = Object.getOwnPropertyNames(o)
    _.map(Object.getOwnPropertyNames(o), (name) => {
      let method = Object.getOwnPropertyDescriptor(o, name)
      if (this._isStaticMethod(name, method)) {
        this._schema.static(name, method.value)
      }
    })
  }

  _createVirtualMethods(o) {
    let properties = Object.getOwnPropertyNames(o)
    _.map(Object.getOwnPropertyNames(o), (name) => {
      let method = Object.getOwnPropertyDescriptor(o, name)
      if (this._isVirtualMethod(name, method)) {
        this._setVirtualMethod(name, method)
      }
    })
  }

  _isStaticMethod(name, method) {
    return (name !== 'prototype' && name != 'schema' && name !== 'length')
  }

  _isInstanceMethod(name, method) {
    return (name !== 'constructor' &&
      name != 'schema' &&
      !(method.set || method.get))
  }

  _isVirtualMethod(name, method) {
    return (name !== 'constructor' &&
      name != 'schema' &&
      (_.has(method, 'set') || _.has(method, 'get')))
  }

  _setVirtualMethod(name, method) {
    let v = this._schema.virtual(name)
    return (_.has(method, 'set')) ? v.set(method.set) : v.get(method.get)
  }

  _bindToApp() {
    this.proton.app.models[this.name] = this
  }

}
