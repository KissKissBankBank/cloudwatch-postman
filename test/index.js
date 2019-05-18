import chai, { expect } from 'chai'

global.chai = chai
global.expect = expect

describe('index', () => {
  it('returns true', () => {
    expect(true).to.eq(true)
  })
})
