chrome.action.onClicked.addListener(tab => {
	chrome.scripting.executeScript({
		target: {tabId: tab.id},
		func: () => {
			alert('Discogs Track Extract has started successfully.');
			}
		});
	});
