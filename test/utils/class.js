'use strict'

const Model = require('../../index')

module.exports = class Test extends Model {

  schema() {
    return {
      name: { type: String },
      createdAt: { type: Date },
    }
  }

  getName() {
    return this.name
  }

  * beforeCreate(values, next) {
    values.createdAt = new Date()
    next()
  }

  * afterCreate(record, next) {
    next()
  }

}
