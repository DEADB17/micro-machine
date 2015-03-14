(function() {
  function MicroMachine(initialState){
    var callbacks = {}
    var before = callbacks.before = {}
    var after = callbacks.after = {}

    var publicMethods = {}
    publicMethods.state = initialState
    publicMethods.transitionsFor = {}

    function endingState(event){
      return publicMethods.transitionsFor[event][publicMethods.state]
    }

    function transitionInfo(event, from, to, phase, isAny) {
      return { event: event, from: from, to: to, phase: phase, isAny: isAny }
    }

    function changeState(event, args){
      var beforeEvent = before[event], beforeAny = before.any
      var afterEvent, afterAny
      var makeTransition = true;
      var from = publicMethods.state, to = endingState(event)
      // avoid making copies of the args array
      // prepend publicMethods and a placeholder for transitionInfo
      args.unshift(publicMethods, 1)

      if (beforeEvent) {
        args[1] = transitionInfo(event, from, to, 'before', false)
        makeTransition = beforeEvent.apply(beforeEvent, args) !== false
      }

      if (makeTransition && beforeAny) {
        args[1] = transitionInfo(event, from, to, 'before', true)
        makeTransition = beforeAny.apply(beforeAny, args) !== false
      }

      if (makeTransition) {
        publicMethods.state = to
        afterEvent = after[event]
        afterAny = after.any

        if (afterEvent) {
          args[1] = transitionInfo(event, from, to, 'after', false)
          afterEvent.apply(afterEvent, args)
        }

        if (afterAny) {
          args[1] = transitionInfo(event, from, to, 'after', true)
          afterAny.apply(afterAny, args)
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
      before[event] = callback
    }

    publicMethods.on = publicMethods.after = function(event, callback) {
      after[event] = callback
    }

    return publicMethods
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = MicroMachine
  else
    window.MicroMachine = MicroMachine
})()
