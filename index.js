(function() {
  var MicroMachine = function(initialState){
    var publicMethods = {}

    publicMethods.state = initialState
    publicMethods.transitionsFor = {}

    var endingState = function(event){
      return publicMethods.transitionsFor[event][publicMethods.state]
    }

    var callbacks = { after: {}}

    var changeState = function(event){
      publicMethods.state = endingState(event)

      if (callbacks.after[event])
        callbacks.after[event](publicMethods)

      if (callbacks.after.any)
        callbacks.after.any(publicMethods)
    }

    publicMethods.canTrigger = function(event){
      return !!endingState(event)
    }

    publicMethods.trigger = function(event){
      if (this.canTrigger(event)){
        changeState(event)
        return true
      } else
        return false
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
