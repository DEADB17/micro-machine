(function(undefined) {
  var BEFORE = 'before'
  var AFTER = 'after'
  var STATE = 'state'
  var APPLY = 'apply'
  var slice = [].slice
  function MicroMachine(initialState){
    var callbacks = {}
    var before = callbacks[BEFORE] = {}
    var after = callbacks[AFTER] = {}

    var publicMethods = {}
    var transitionsFor = publicMethods.transitionsFor = {}
    publicMethods[STATE] = initialState

    function transitionInfo(event, from, to, phase, isAny) {
      return { event: event, from: from, to: to, phase: phase, isAny: isAny }
    }

    publicMethods.canTrigger = function(event){
      return !!transitionsFor[event][publicMethods[STATE]]
    }

    publicMethods.trigger = function(event){
      var from = publicMethods[STATE]
      var to = transitionsFor[event][from]
      if (to) {
        var args = slice.call(arguments, 1)
        var beforeEvent = before[event]
        var beforeAny = before.any
        var afterEvent, afterAny
        var makeTransition = true;
        // avoid making copies of the args array
        // prepend publicMethods and a placeholder for transitionInfo
        args.unshift(publicMethods, 1)

        if (beforeEvent) {
          args[1] = transitionInfo(event, from, to, BEFORE, false)
          makeTransition = beforeEvent[APPLY](beforeEvent, args) !== false
        }

        if (makeTransition && beforeAny) {
          args[1] = transitionInfo(event, from, to, BEFORE, true)
          makeTransition = beforeAny[APPLY](beforeAny, args) !== false
        }

        if (makeTransition) {
          publicMethods[STATE] = to
          afterEvent = after[event]
          afterAny = after.any

          if (afterEvent) {
            args[1] = transitionInfo(event, from, to, AFTER, false)
            afterEvent[APPLY](afterEvent, args)
          }

          if (afterAny) {
            args[1] = transitionInfo(event, from, to, AFTER, true)
            afterAny[APPLY](afterAny, args)
          }

          return true
        }
      }
      return false
    }

    publicMethods[BEFORE] = function(event, callback) {
      before[event] = callback
    }

    publicMethods.on = publicMethods[AFTER] = function(event, callback) {
      after[event] = callback
    }

    return publicMethods
  }

  if (module !== undefined && module.exports !== undefined)
    module.exports = MicroMachine
  else
    window.MicroMachine = MicroMachine
})()
