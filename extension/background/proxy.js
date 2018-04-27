// proxy message from/to content script
const proxy = (() => {
  const eventHandlers = {}

  const invoke = (tabId, command, params) => {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(
        tabId,
        {
          command,
          params,
        },
        response => {
          if (response && response.error) {
            reject(response.error)
          } else {
            resolve(response)
          }
        }
      )
    })
  }

  const on = (command, cb) => {
    if (typeof cb !== 'function') throw new Error('callback should be function')
    eventHandlers[command] = cb
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    Promise.resolve()
      .then(() => {
        const { command, params } = message
        const handler = eventHandlers[command]
        if (typeof handler !== 'function') {
          throw new Error('handler not found for command: ' + command)
        } else {
          return handler(params)
        }
      })
      .then(result => {
        return sendResponse(result)
      })
      .catch(error => {
        sendResponse({
          errmsg: error,
        })
      })
    return true
  })

  return {
    invoke,
    on,
  }
})()
