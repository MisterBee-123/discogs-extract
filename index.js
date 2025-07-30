async function returnTrackInfo() {

	var error = false;
	let trackId = document.getElementById('trackID').value;
	if ((trackId === '') || (Number.isNaN(trackId))) {
		document.getElementById('trackInfo').value = 'Please enter a numeric track ID.';
		error = true;
	}
	if (error === false) {
		let [tab] = await chrome.tabs.query({ active: true });
		chrome.scripting
		.executeScript({
			target: { tabId: tab.id },
			func: getDiscogsData,
			args: [trackId]
		})
		.then(injectionResult => {
			for (const {frameId, result} of injectionResult) {
				document.getElementById('trackInfo').value = result;
				writeTrackInfoToStorage();
			}
    	});
    }
}

async function addToSetlist() {

	var trackInfo = document.getElementById('trackInfo').value;
	if (trackInfo !== '') {
		var setlist = document.getElementById('setlist').value + trackInfo.split('\n')[0] + ': ' + trackInfo.split('\n')[1] + '\n';
		document.getElementById('setlist').value = setlist;
		writePlaylistToStorage();
	}
}

async function writeTrackInfoToStorage() {
	
	var trackInfo = document.getElementById('trackInfo').value;
	chrome.storage.local.set({ "trackInfo": trackInfo }).then(() => {
		console.log("Updated track info in local storage!");
	});
}

async function clearSetlist() {
	
	document.getElementById('setlist').value = null;
	chrome.storage.local.remove( "setlist" );
}

async function writePlaylistToStorage() {
	
	var setlist = document.getElementById('setlist').value;
	chrome.storage.local.set({ "setlist": setlist }).then(() => {
		console.log("Updated setlist in local storage!");
	});
}

function getDiscogsData(trackCounter) {

	function removeParens(dataString) {
		var newString = dataString;
		let openParen = dataString.indexOf('(');
		if (openParen > 0) {
			let closeParen = dataString.indexOf(')');
			if (closeParen > 0) {
				var newString = dataString.substring(0, openParen - 1) + dataString.substring(closeParen + 1); 
			}
		}
		return newString;
	}

	if (window.location.hostname != 'www.discogs.com') { 
		return 'This extension can only be used on discogs.com.';
	}
	if (!window.location.pathname.includes('release')) {
		return 'Please select a release.';
	}
	let trackTable = document.getElementsByClassName('tracklist_ZdQ0I')[0];
	if (trackCounter > trackTable.rows.length) {
		return 'That track number does not exist on this release.';
	}
    else {
		let artistAlbum = document.getElementsByTagName('h1')[0];
		let artistAlbumText = artistAlbum.innerText;
		let hyphen = String.fromCharCode(8211); // Discogs uses the en-dash, unicode #8211
		var artist = removeParens(artistAlbum.innerText.split(' ' + hyphen + ' ')[0]);
		if (artist[artist.length - 1] === '*') {
			artist = artist.slice(0, -1);
		}
		var album = artistAlbum.innerText.split(' ' + hyphen + ' ')[1];
		
		let releaseInfo = document.getElementsByClassName('table_c5ftk')[0];
		let releaseLabel = removeParens(releaseInfo.rows[0].getElementsByTagName('td')[0].innerText);

		var releaseDateIndex = 0;
		for (let albumInfoIndex = 0; albumInfoIndex < releaseInfo.rows.length; albumInfoIndex++) {
			let header = releaseInfo.rows[albumInfoIndex].getElementsByTagName('th')[0].getElementsByTagName('h2')[0].innerText;
			if (header.includes('Released')) {
				var releaseDateIndex = albumInfoIndex;
			}
		}

		let releaseDateLine = releaseInfo.rows[releaseDateIndex].getElementsByTagName('td')[0].getElementsByTagName('time')[0];
		if (releaseDateLine === undefined) {
			var releaseYear = '';
		} else {
			let releaseDateText = releaseDateLine.innerText;
			let releaseDate = new Date(releaseDateText);
			releaseDate.setDate(releaseDate.getDate() + 1);
			var releaseYear = releaseDate.getFullYear();
		}
		
		var currentTrack = 0;
		let trackNumber = trackCounter - 1;
		var trackName = '';
		for (let trackTableIndex = 0; trackTableIndex < trackTable.rows.length; trackTableIndex++) {
			let rowData = trackTable.rows[trackTableIndex];
			if (rowData.hasAttribute('data-track-position')) {
				currentTrack++;
				if ((currentTrack - trackCounter) === 0) {
					var trackName = rowData.getElementsByClassName('trackTitle_loyWF')[1].innerText;
					if (artist === 'Various') {
						var artist = rowData.getElementsByTagName('a')[0].innerText;
					}
				}
			}
		}
		if (trackName === '') {
			return 'This track number does not exist on this release.';
		}

		let returnData = artist + '\n' + trackName + '\n' + album + '\n' + releaseLabel + '\n' + releaseYear;
		return returnData;
	}
}

console.log('Extension is starting!');

chrome.storage.local.get('trackInfo', function(result) {
	var trackInfo = result.trackInfo;
	console.log(trackInfo);
	if (trackInfo !== undefined) {
		document.getElementById('trackInfo').value = trackInfo;
	}
});
	
chrome.storage.local.get('setlist', function(result) {
	var setlist = result.setlist;
	console.log(setlist);
	if (setlist !== undefined) {
		document.getElementById('setlist').value = setlist;
	}
});

document.getElementById('getTrackInfo').addEventListener('click', returnTrackInfo);
document.getElementById('addToSetlist').addEventListener('click', addToSetlist);
document.getElementById('clearSetlist').addEventListener('click', clearSetlist);
document.getElementById('trackInfo').addEventListener('change', writeTrackInfoToStorage);
document.getElementById('setlist').addEventListener('change', writePlaylistToStorage);
