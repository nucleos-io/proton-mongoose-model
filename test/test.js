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
      .then(record => {
        record.getName()
        done()
      })
      .catch(err => done(err))
  })

  it('Model.parseObjectId', done => {
    const ObjectId = TestClass.adapter.Types.ObjectId
    const validObjectId = TestClass.parseObjectId(new ObjectId())
    const invalidObjectId = TestClass.parseObjectId('invalid ObjectId')
    if (validObjectId === null) {
      return done(new Error('Error parsing ObjectId to ObjectId'))
    }
    if (invalidObjectId !== null) {
      return done(new Error('Error parsing invalid string to ObjectId'))
    }
    done()
  })
})
