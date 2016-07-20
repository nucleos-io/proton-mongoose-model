'use strict'

const _ = require('lodash')
const BaseModel = require('proton-base-model')
const mongoose = require('mongoose')
const co = require('co')

/**
 * @class MongooseModel
 * @classdesc The mongoose model class allow to build models in a more elegant
 * way in mongoose
 * @todo add triggers methods as beforeCreate, beforeUpdate... etc
 * @author Luis Hernandez
 */
class MongooseModel extends BaseModel {

  constructor(proton) {
    super(proton)
    this._schema = {}
  }

  /**
   * @method
   * @override
   * @description this method is responsible of get the schema object from
   * mongoose and generate the model
   * @param mongoose - the mongoose adapter
   * @param uri - the mongo uri connecion
   * @author Luis Hernandez
   */
  build(mongoose) {
    this.mongoose = mongoose
    this.mongoose.Promise = global.Promise
    this.model = this._generateModel()
    return this.model
  }

  /**
   * @method schema
   * @description this must be override, and his responsability is
   * @return an object with the structure of a mongoose schema
   */
  schema() {
    return new Error('You must implement the method schema')
  }

  /**
   * @method options
   * @description the object wiht options for instance the mongoose.Schema
   * @return Object
   */
  options() {
    return {}
  }

  /**
   * @method config
   * @description config the instance of schema before create the model
   * @param schema - mongoose.Schema
   */
  config(schema) {}

  _generateModel() {
    return this.mongoose.model(this.name, this._buildSchema())
  }

  _buildSchema() {
    const prototype = this.constructor.prototype
    const constructor = this.constructor
    this._schema = new this.mongoose.Schema(this.schema(), this.options())
    this._createStaticMethods(constructor)
    this._createInstanceMethods(prototype)
    this._createVirtualMethods(prototype)
    this._initLifeCycleCallbacks(this._schema)
    this.config(this._schema)
    return this._schema
  }

  _initLifeCycleCallbacks(schema) {
    const self = this
    schema.pre('save', function(next) {
      self.beforeCreate = co.wrap(self.beforeCreate)
      self.beforeCreate(this, next)
    })
    schema.post('save', function(doc, next) {
      self.afterCreate = co.wrap(self.afterCreate)
      self.afterCreate(doc, next)
    })
  }

  * beforeCreate(values, next) {
    next()
  }

  * afterCreate(values, next) {
    next()
  }

  _createInstanceMethods(o) {
    _.map(Object.getOwnPropertyNames(o), (name) => {
      const method = Object.getOwnPropertyDescriptor(o, name)
      if (this._isInstanceMethod(name, method)) {
        this._schema.method(name, method.value)
      }
    })
  }

  _createStaticMethods(o) {
    const properties = Object.getOwnPropertyNames(o)
    _.map(properties, (name) => {
      const method = Object.getOwnPropertyDescriptor(o, name)
      if (this._isStaticMethod(name, method)) {
        this._schema.static(name, co.wrap(method.value))
      }
    })
  }

  _createVirtualMethods(o) {
    const properties = Object.getOwnPropertyNames(o)
    _.map(Object.getOwnPropertyNames(o), (name) => {
      const method = Object.getOwnPropertyDescriptor(o, name)
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
    const v = this._schema.virtual(name)
    return (_.has(method, 'set')) ? v.set(co.wrap(method.set)) : v.get(co.wrap(method.get))
  }


}

MongooseModel.adapter = mongoose
MongooseModel.Schema = mongoose.Schema
MongooseModel.types = mongoose.Schema.Types

module.exports = MongooseModel
