chrome.action.onClicked.addListener(tab => {
	chrome.scripting.executeScript({
		target: {tabId: tab.id},
		func: () => {
			alert('Hi there from my extension!');
			}
		});
	});