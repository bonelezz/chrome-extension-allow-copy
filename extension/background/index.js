const background = (() => {
  const ACTIVE_ICON = 'icons/active.png'
  const INACTIVE_ICON = 'icons/inactive.png'

  const getOrigin = url => {
    const [match, origin] = /^((https?|file):\/\/[^/]+)/.exec(url) || []
    return origin
  }

  const updateExtensionStatus = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
      if (activeTab && activeTab.url) {
        const origin = getOrigin(activeTab.url)
        if (origin) {
          configManager.getSiteConfig({ origin }).then(config => {
            const { unlock } = config
            chrome.browserAction.setIcon({
              path: unlock ? ACTIVE_ICON : INACTIVE_ICON,
            })
          })
        } else {
          chrome.browserAction.setIcon({
            path: INACTIVE_ICON,
          })
        }
      } else {
        chrome.browserAction.setIcon({
          path: INACTIVE_ICON,
        })
      }
    })
  }

  proxy.on('getSiteConfig', ({ origin }) => {
    return configManager.getSiteConfig({ origin })
  })
  proxy.on('setSiteConfig', ({ origin, config }) => {
    return configManager.setSiteConfig({ origin, config }).then(result => {
      updateExtensionStatus()
      return result
    })
  })

  chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
      if (activeTab) {
        proxy.invoke(activeTab.id, 'toggle')
      }
    })
  })
  chrome.tabs.onActivated.addListener(updateExtensionStatus)
  chrome.tabs.onActiveChanged.addListener(updateExtensionStatus)

  const pruneConfigs = () => {
    chrome.storage.local.get(null, configs => {
      const keysToPrune = Object.keys(configs).filter(key => {
        const value = configs[key]
        return value && value.unlock === false
      })
      chrome.storage.local.remove(keysToPrune, console.log)
    })
  }

  pruneConfigs()
})()
