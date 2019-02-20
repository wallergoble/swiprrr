const INTERVAL_VARIABLE_NAME = '__interval'

const startButton = document.getElementById('start')
const stopButton = document.getElementById('stop')

startButton.addEventListener('click', injectInterval)
stopButton.addEventListener('click', clearInt)

function createErrorElement(message) {
  const el = document.createElement('p')

  el.innerText = message
  document.body.append(el)
}

chrome.runtime.onMessage.addListener(
  function (message, sender, sendResponse) {
    if (message.error) {
      createErrorElement(message.error)
    }
  });

function _getSwipeButtonSelectorByApp(url) {
  const { hostname } = new URL(url)

  switch (hostname) {
    case 'bumble.com':
      return "document.getElementsByClassName('encounters-controls__actions')[0].lastChild.children[0].children[0]";
    case 'tinder.com':
      return "document.getElementsByClassName('button__text Pos(r) Z(1)')[3]";
    default:
      alert('Current website is not supported, please go to bumble or tinder or something sexier')
  }
}

function _generateClickScript(selector, interval) {
  // put interval on window so we can reassign it on multiple starts and stops
  return `
  ${INTERVAL_VARIABLE_NAME} = setInterval(() => {
    const button = ${selector}

    if (button) {
      button.click()
    } else {
      return
    }
  }, ${interval})
  `
}

function injectInterval() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

    const selector = _getSwipeButtonSelectorByApp(tabs[0].url)
    const interval = document.getElementById('interval').value * 1000 || 1000

    chrome.tabs.executeScript(
      tabs[0].id,
      {
        code: _generateClickScript(selector, interval)
      }
    );
  });
}

function clearInt() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.executeScript(
      tabs[0].id,
      {
        code: `clearInterval(${INTERVAL_VARIABLE_NAME})`
      }
    );
  });
}