(function() {
  var MicroMachine = function(initialState){
    var publicMethods = {}

    publicMethods.state = initialState
    publicMethods.transitionsFor = {}

    var endingState = function(event){
      return publicMethods.transitionsFor[event][publicMethods.state]
    }

    var callbacks = { before: {}, after: {}}

    var changeState = function(event){
      var makeTransition = true;

      if (callbacks.before[event])
        makeTransition = callbacks.before[event](publicMethods) !== false

      if (makeTransition && callbacks.before.any)
        makeTransition = callbacks.before.any(publicMethods) !== false

      if (makeTransition) {
        publicMethods.state = endingState(event)

        if (callbacks.after[event])
          callbacks.after[event](publicMethods)

        if (callbacks.after.any)
          callbacks.after.any(publicMethods)

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
