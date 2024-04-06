// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// The value that will be written to the clipboard.

// When the browser action is clicked, `addToClipboard()` will use an offscreen
// document to write the value of `textToCopy` to the system clipboard.

// -------------- //
// change history //
// -------------- //
//
// Kuropen 2024/4/6 add function to add decoded URI to clipboard.
//

chrome.action.onClicked.addListener(async () => {  
  await addUrlToClipboard();
});

chrome.commands.onCommand.addListener(async (command) => {
  await addUrlToClipboard();    
});

async function addUrlToClipboard() {
  await chrome.tabs.query({
    active: true,
    currentWindow: true,
  }, (tabs) => {
    let url = tabs[0].url;
    url = decodeURI(url);
    addToClipboard(url);
  });
}

// Solution 1 - As of Jan 2023, service workers cannot directly interact with
// the system clipboard using either `navigator.clipboard` or
// `document.execCommand()`. To work around this, we'll create an offscreen
// document and pass it the data we want to write to the clipboard.
async function addToClipboard(value) {
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: [chrome.offscreen.Reason.CLIPBOARD],
    justification: 'Write text to the clipboard.'
  });

  // Now that we have an offscreen document, we can dispatch the
  // message.
  chrome.runtime.sendMessage({
    type: 'copy-data-to-clipboard',
    target: 'offscreen-doc',
    data: value
  });
}

// Solution 2 – Once extension service workers can use the Clipboard API,
// replace the offscreen document based implementation with something like this.
// eslint-disable-next-line no-unused-vars -- This is an alternative implementation
async function addToClipboardV2(value) {
  navigator.clipboard.writeText(value);
}