'use strict'

const Model = require('../../index')

module.exports = class Test extends Model {
  schema() {
    return {
      name: {type: String}
    }
  }

  static create(opts) {
    const test = new this({name: 'Luis Hernandez'})
    return test.save()
  }

  static update(criteria, opts) {}
  static findOne(criteria) {}
}
