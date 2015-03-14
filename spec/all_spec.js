/*jshint jasmine:true, quotmark:false*/

var MicroMachine = require('../')

var machine

function prepareMachine(){
  beforeEach(function(){
    machine = new MicroMachine('pending')
    machine.transitionsFor.confirm = {pending: 'confirmed'}
    machine.transitionsFor.ignore = {pending: 'ignored'}
    machine.transitionsFor.reset = {confirmed: 'pending', ignored: 'pending'}
  })
}

describe("basic usage", function(){
  describe("initial state", function(){
    prepareMachine()

    it("has an initial state", function(){
      expect(machine.state).toBe('pending')
    })
  })

  describe("#canTrigger", function(){
    prepareMachine()

    it("returns true when the event is available", function(){
       expect(machine.canTrigger('confirm')).toBe(true)
    })

    it("returns false when the event is unavailable", function(){
       expect(machine.canTrigger('reset')).toBe(false)
    })
  })

  describe("#trigger", function(){
    prepareMachine()

    it("returns true when the event is available", function(){
       expect(machine.trigger('confirm')).toBe(true)
    })

    it("switches state to the new one when the transition was successful", function(){
       machine.trigger('confirm')
       expect(machine.state).toBe('confirmed')
    })

    it("returns false when the event is unavailable", function(){
       expect(machine.trigger('reset')).toBe(false)
    })

    it("preserves state when the transition was unsucessful", function(){
       machine.trigger('reset')
       expect(machine.state).toBe('pending')
    })
  })
})

describe("callbacks", function(){
  describe("#before", function(){

    prepareMachine()

    it("accepts a callback to be invoked before a transition", function(){
      var state = "pending"
      machine.before("confirm", function() { return true })
      machine.on("confirm", function() { state = "confirmed" })

      machine.trigger('confirm')

      expect(state).toBe("confirmed")
    })

    it("can cancel a transition when a specific event is triggered", function(){
      var state = "pending"
      machine.before("confirm", function() { return false })
      machine.on("confirm", function() { state = "confirmed" })

      machine.trigger('confirm')

      expect(state).toBe("pending")
    })

    it("accepts a callback to be invoked before any transitions", function(){
      var state, before
      machine.before('any', function(machine){
        before = machine.state
      })
      machine.on('any', function(machine){
        state = machine.state
      })

      machine.trigger('ignore')
      expect(before).toBe('pending')
      expect(state).toBe('ignored')

      machine.trigger('reset')
      expect(before).toBe('ignored')
      expect(state).toBe('pending')
    })

    it("can cancel a transition when any event is triggered", function(){
      var state = "pending"
      machine.before("any", function() { return false })
      machine.on("confirm", function() { state = "confirmed" })

      machine.trigger('confirm')

      expect(state).toBe("pending")
    })

    it("triggers specific events before any events", function(){
      var state = "pending"
      var before = state
      machine.before("confirm", function() { before = "before-pending" })
      machine.before("any", function() { return false })
      machine.on("confirm", function() { state = "confirmed" })

      machine.trigger('confirm')

      expect(state).toBe("pending")
      expect(before).toBe("before-pending")
    })

    it("invokes multiple callbacks", function(){
      var counter = 0

      machine.before('any', function(machine){
        counter++
      })
      machine.after('any', function(machine){
        counter--
      })

      machine.before('ignore', function(machine){
        counter++
      })
      machine.after('ignore', function(machine){
        counter--
      })

      machine.trigger('ignore')
      expect(counter).toBe(0)
    })
  })

  describe("#on/#after", function(){

    prepareMachine()

    it("accepts a callback invoked when entering a state", function(){
      var state
      machine.on("confirm", function() { state = "confirmed" })

      machine.trigger('confirm')

      expect(state).toBe("confirmed")
    })

    it("doesn't invoke callback until its state is reached", function(){
      var state
      machine.on("confirm", function() { throw new Error() })

      machine.trigger('ignore')

      expect(state).toBe(undefined)
    })

    it("invokes callback for 'any' if it's been defined", function(){
      var state
      machine.on('any', function(machine){
        state = machine.state
      })

      machine.trigger('ignore')
      expect(state).toBe('ignored')

      machine.trigger('reset')
      expect(state).toBe('pending')
    })

    it("invokes multiple callbacks", function(){
      var counter = 0

      machine.on('any', function(machine){
        counter++
      })

      machine.on('ignore', function(machine){
        counter++
      })

      machine.trigger('ignore')
      expect(counter).toBe(2)
    })
  })

  describe("arguments", function(){
    prepareMachine()

    it("passes the transition information before a specific transition", function(){
      machine.before("confirm", function(m, transition) {
        expect(transition).toEqual({ event: 'confirm', from: 'pending', to: 'confirmed', phase: 'before', isAny: false })
      })
      machine.trigger('confirm')
    })

    it("passes the transition information before a generic transition", function(){
      machine.before("any", function(m, transition) {
        expect(transition).toEqual({ event: 'confirm', from: 'pending', to: 'confirmed', phase: 'before', isAny: true })
      })
      machine.trigger('confirm')
    })

    it("passes the transition information after a specific transition", function(){
      machine.on("confirm", function(m, transition) {
        expect(transition).toEqual({ event: 'confirm', from: 'pending', to: 'confirmed', phase: 'after', isAny: false })
      })
      machine.trigger('confirm')
    })

    it("passes the transition information after a generic transition", function(){
      machine.on("any", function(m, transition) {
        expect(transition).toEqual({ event: 'confirm', from: 'pending', to: 'confirmed', phase: 'after', isAny: true })
      })
      machine.trigger('confirm')
    })

    it("avoids sharing references between callbacks", function(){
      machine.before("confirm", function(m, transition) {
        expect(transition).toEqual({ event: 'confirm', from: 'pending', to: 'confirmed', phase: 'before', isAny: false })
        transition.event = null
        transition.from = null
        transition.to = null
        transition.phase = null
        transition.isAny = null
      })
      machine.after("confirm", function(m, transition) {
        expect(transition).toEqual({ event: 'confirm', from: 'pending', to: 'confirmed', phase: 'after', isAny: false })
      })
      machine.trigger('confirm')
    })

    it("receives any additional arguments from the trigger", function(){
      machine.after("confirm", function(m, transition, a, b, c) {
        expect(arguments.length).toBe(6)
        expect(a).toEqual([])
        expect(b).toEqual({})
        expect(c).toEqual('c')
      })
      machine.trigger('confirm', [], {}, 'c', 4)
    })
  })
})

describe("composition capabilites", function(){

  function User(){
    var machine = new MicroMachine("pending")

    machine.transitionsFor.confirm = {pending: 'confirmed'}
    machine.transitionsFor.reset = {confirmed: 'pending'}

    self = this
    machine.on("any", function(machine){
      self.state = machine.state
    })

    this.confirm = function(){
      machine.trigger('confirm')
    }

    this.state = undefined

    return this
  }

  it("enables easy composition", function(){
    var user = new User()
    user.confirm()
    expect(user.state).toBe("confirmed")
  })
})
