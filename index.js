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

    var changeState = function(event, args){
      var makeTransition = true;
      var from = publicMethods.state, to = endingState(event)
      // avoid making copies of the args array
      // prepend publicMethods and a placeholder for transitionInfo
      args.unshift(publicMethods, 1)

      if (callbacks.before[event]) {
        args[1] = transitionInfo(event, from, to, 'before', false)
        makeTransition = callbacks.before[event].apply(null, args) !== false
      }

      if (makeTransition && callbacks.before.any) {
        args[1] = transitionInfo(event, from, to, 'before', true)
        makeTransition = callbacks.before.any.apply(null, args) !== false
      }

      if (makeTransition) {
        publicMethods.state = to

        if (callbacks.after[event]) {
          args[1] = transitionInfo(event, from, to, 'after', false)
          callbacks.after[event].apply(null, args)
        }

        if (callbacks.after.any) {
          args[1] = transitionInfo(event, from, to, 'after', true)
          callbacks.after.any.apply(null, args)
        }

        return true
      }
      return false
    }

    publicMethods.canTrigger = function(event){
      return !!endingState(event)
    }

    publicMethods.trigger = function(event){
      var args = Array.prototype.slice.call(arguments, 1)
      return this.canTrigger(event) && changeState(event, args)
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
