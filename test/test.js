'use strict'

const mongoose = require('mongoose')
const TestClass = require('./utils/class')

const test = new TestClass()

before(function(){
  const connection = mongoose.connect('mongodb://localhost:27017')
});

describe('Mongoose model test',  () => {
  it('should build a proton-mongoose-models', done => {
    global[test.name] = test.build(mongoose)
    done()
  })

  it('should create a new record with a static method', done => {
    Test.create()
      .then(record => done())
      .catch(err => done(err))
  })
})
