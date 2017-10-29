function unblock() {
  const directCopyEvents = ['copy', 'cut', 'contextmenu', 'selectstart']
  const rejectOtherHandlers = e => {
    e.stopPropagation()
    if (e.stopImmediatePropagation) e.stopImmediatePropagation()
  }
  directCopyEvents.forEach(evt => {
    document.documentElement.addEventListener(evt, rejectOtherHandlers, {
      capture: true
    })
  })

  const indirectCopyEvents = [
    'mousedown',
    'mouseup',
    'mousemove',
    'keydown',
    'keypress',
    'keyup'
  ]
  const oldPrevent = Event.prototype.preventDefault
  Event.prototype.preventDefault = function() {
    if (indirectCopyEvents.indexOf(this.type) !== -1) {
      console.info(
        `[allow-copy] webpage attempting to block "${this.type}" event, ignored`
      )
    } else {
      oldPrevent.apply(this, arguments)
    }
  }
}
try {
  const script = document.createElement('SCRIPT')
  script.id = 'allow-copy_script'
  script.textContent = `(${unblock})()`
  document.documentElement.append(script)
} catch (error) {
  console.warn(`[allow-copy] failed to inject script`, error)
}

// allow select in css
const style = document.createElement('STYLE')
style.id = 'allow-copy_style'
style.innerHTML =
  ' html,body,*,*::before,*::after { -webkit-user-select: initial; user-select: initial !important; } '
document.documentElement.append(style)
