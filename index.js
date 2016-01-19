'use strict'

let mongoose = require('mongoose')
let Schema = mongoose.Schema


module.exports = class Model {

  constructor(options) {
    this._schema = {}
    this.options = options || {}
  }

  _buildSchema() {
    let prototype = this.constructor.prototype
    let constructor = this.constructor
    this._schema = new Schema(this.schema(), {})
    this._createStaticMethods(constructor)
    this._createInstanceMethods(prototype)
    this._createVirtualMethods(prototype)
    return this._schema

  }

  _generateModel() {
    return mongoose.model(this.constructor.name, this._buildSchema())
  }

  static build(opts) {
    let model = new this(opts)
    return model._generateModel()
  }

  schema() {
    return new Error('You must implement the method schema')
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

}
