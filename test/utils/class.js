'use strict'

const Model = require('../../index')

module.exports = class Test extends Model {
  schema() {
    return {
      name: {type: String}
    }
  }

  static * create(opts) {
    const test = new this({name: 'Luis Hernandez'})
    const result = yield test.save()
    console.log('hola', result)
    return result
  }

  static * update(criteria, opts) {
    return yield Promise.resolve()
  }
  static findOne(criteria) {}
}
