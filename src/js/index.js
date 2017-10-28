console.log('5')
const noop = () => {}

// forbid preventDefault() and `return false` for some important events
const allowDefaultEvents = [
  'mousedown',
  'mouseup',
  'mousemove',
  'keydown',
  'keypress',
  'keyup'
]
const allowDefault = (handler, target) => e => {
  console.log('protecting ', e)
  e.preventDefault = noop
  const returnValue = handler.bind(target, e) || true
  e.returnValue = true
  return returnValue
}
const oldAddEventListener = EventTarget.prototype.addEventListener
EventTarget.prototype.addEventListener = Element.prototype.addEventListener = Window.prototype.addEventListener = function(
  evt,
  handler,
  ...rest
) {
  console.log('evt ', evt)
  const newArgs =
    allowDefaultEvents.indexOf(evt) !== -1
      ? [evt, allowDefault(handler, this), ...rest]
      : arguments
  return oldAddEventListener.apply(this, newArgs)
}

// reject every other handlers because this event has a sole purpose and is VERY IMPORTANT!!
const copyEvents = [
  'copy',
  'cut',
  'contextmenu',
  'selectstart',
  'dragstart',
  'drag',
  'dragend'
]
const rejectOtherHandlers = e => {
  e.stopPropagation()
  if (e.stopImmediatePropagation) {
    e.stopImmediatePropagation()
  }
}
copyEvents.forEach(evt =>
  document.documentElement.addEventListener(
    evt,
    e => {
      rejectOtherHandlers(e)
    },
    {
      capture: true
    }
  )
)

// unblock keypress events
// const keyEvents = ['keydown', 'keypress', 'keyup']
// keyEvents.forEach(evt =>
//   document.documentElement.addEventListener(
//     evt,
//     e => {
//       if (e.ctrlKey || e.metaKey || e.key === 'F12') {
//         rejectOtherHandlers(e)
//       }
//     }, {
//       capture: true
//     }
//   )
// )

// unblock mouse events
// const mouseEvents = ['mousedown', 'mouseup', 'mousemove']
// mouseEvents.forEach(evt =>
//   document.documentElement.addEventListener(
//     evt,
//     e => {
//       e.preventDefault = noop
//       Object.defineProperty(e, 'returnValue', {
//         get() {
//           return true
//         },
//         set(v) {
//           console.log('attempt to set', v)
//         }
//       })
//       // protect(e)
//     }, {
//       capture: true
//     }
//   )
// )

// allow select in css
const style = document.createElement('STYLE')
style.innerHTML = ' * { user-select: initial !important; } '
if (document.head) document.head.append(style)
