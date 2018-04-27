const background = (() => {
  const updateIcon = () => {
    const getOrigin = url => {
      const [match, origin] = /^((https?|file):\/\/[^/]+)/.exec(url) || []
      return origin
    }
    const ACTIVE_ICON = 'icons/active.png'
    const INACTIVE_ICON = 'icons/inactive.png'
    chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
      if (activeTab && activeTab.url) {
        const origin = getOrigin(activeTab.url)
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
    })
  }

  proxy.on('getSiteConfig', ({ origin }) => {
    return configManager.getSiteConfig({ origin })
  })
  proxy.on('setSiteConfig', ({ origin, config }) => {
    return configManager.setSiteConfig({ origin, config }).then(result => {
      updateIcon()
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
  chrome.tabs.onActivated.addListener(updateIcon)
  chrome.tabs.onActiveChanged.addListener(updateIcon)
})()
