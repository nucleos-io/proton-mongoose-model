'use strict'

const mongoose = require('mongoose')
const TestClass = require('./utils/class')

const test = new TestClass()

describe('Mongoose model test',  () => {
  it('should build a proton-mongoose-models', done => {
    const connection = mongoose.connect('mongodb://localhost:27017/proton')
    global[test.name] = test.build(connection)
    done()
  })

  it('should create a new record with a static method', done => {
    Test.create({ name: 'Ernesto Rojas' })
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
