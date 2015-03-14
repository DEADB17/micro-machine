(function() {
  var MicroMachine = function(initialState){
    var publicMethods = {}

    publicMethods.state = initialState
    publicMethods.transitionsFor = {}

    var endingState = function(event){
      return publicMethods.transitionsFor[event][publicMethods.state]
    }

    var callbacks = { before: {}, after: {}}

    var transitionInfo = function (event, from, to, phase, isAny) {
      return { event: event, from: from, to: to, phase: phase, isAny: isAny }
    }

    var changeState = function(event){
      var transition, makeTransition = true;
      var from = publicMethods.state, to = endingState(event)

      if (callbacks.before[event]) {
        transition = transitionInfo(event, from, to, 'before', false)
        makeTransition = callbacks.before[event](publicMethods, transition) !== false
      }

      if (makeTransition && callbacks.before.any) {
        transition = transitionInfo(event, from, to, 'before', true)
        makeTransition = callbacks.before.any(publicMethods, transition) !== false
      }

      if (makeTransition) {
        publicMethods.state = to

        if (callbacks.after[event]) {
          transition = transitionInfo(event, from, to, 'after', false)
          callbacks.after[event](publicMethods, transition)
        }

        if (callbacks.after.any) {
          transition = transitionInfo(event, from, to, 'after', true)
          callbacks.after.any(publicMethods, transition)
        }

        return true
      }
      return false
    }

    publicMethods.canTrigger = function(event){
      return !!endingState(event)
    }

    publicMethods.trigger = function(event){
      return this.canTrigger(event) && changeState(event)
    }

    publicMethods.before = function(event, callback) {
      callbacks.before[event] = callback
    }

    publicMethods.on = publicMethods.after = function(event, callback) {
      callbacks.after[event] = callback
    }

    return publicMethods
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = MicroMachine
  else
    window.MicroMachine = MicroMachine
})()
