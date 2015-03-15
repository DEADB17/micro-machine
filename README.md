## Micro Machine

[![Build Status](https://travis-ci.org/shime/micro-machine.svg?branch=master)](https://travis-ci.org/shime/micro-machine)

Minimal state machine implementation.

Heavily inspired by [soveran/micromachine](https://github.com/soveran/micromachine).

### Installation

```shell
npm install micro-machine
```

### Usage

```javascript
var Machine = require('micro-machine')
  , machine = new Machine('pending')

machine.transitionsFor.confirm = { pending: 'confirmed' }
machine.transitionsFor.reset = { confirmed: 'pending' }

machine.trigger('confirm')
console.log(machine.state) // 'confirmed'
machine.trigger('reset')
console.log(machine.state) // 'pending'
```

Multiple state pairs cand be defined for a transition.
For example, a circular relationship:

```javascript
var Machine = require('micro-machine')
  , machine = new Machine('slide1')

machine.transitionsFor.next = { slide1: 'slide2', slide2: 'slide3', slide3: 'slide1' }

machine.trigger('next')
console.log(machine.state) // 'slide2'
machine.trigger('next')
console.log(machine.state) // 'slide3'
machine.trigger('next')
console.log(machine.state) // 'slide1'
// ...
```

`triggers` return `true` or `false`, representing whether the transition
succeeded or not.

```javascript
var Machine = require('micro-machine')
  , machine = new Machine('pending')

machine.transitionsFor.confirm = { pending: 'confirmed' }

machine.trigger('confirm') // true
machine.trigger('confirm') // false, there is no confirm event for the confirmed state
```

If you rely on the transition being successful, you could have specified the
above example as: 

```javascript
machine.transitionsFor.confirm = { pending: 'confirmed', confirmed: 'confirmed' }
```

### Callbacks

You can attach callback functions that will be invoked either before or after
the specified transition.

```javascript
var Machine = require('micro-machine')
  , machine = new Machine('pending')
  
machine.transitionsFor.confirm = { pending: 'confirmed' }
machine.transitionsFor.reset = { confirmed: 'pending' }

var state

/* Use 'any' to define callback for any transition. */
machine.on('any',  function(machine){
  state = machine.state
})

machine.on('reset', function() { console.log('resetting...') })

machine.trigger('confirm')
console.log(state)  // 'confirmed'

machine.trigger('reset') // 'resetting...'
```

#### `before` and `after` callbacks

```js
machine.before('event', function() {  })
machine.after('event', function() {  })
```

`before` callbacks can prevent a transition by explicitly returning `false`.

`after` and `on` are aliases. Their behaviour is identical.

#### Callback parameters

```js
machine.on('event', function (machine, transition, ...) {})
// machine -> the machine in the state after the transition
// transition -> { event: event, from: state, to: state, phase: before|after, isAny: bool }
// ... all additional parameters passed in the trigger
```

### Development

Run tests with

    npm test

or build it with

    npm run build

### Unlicense

This repository and its contents belong to the public domain.

It has been released under the [UNLICENSE](https://github.com/shime/micro-machine/blob/master/UNLICENSE).
