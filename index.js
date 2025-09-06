async function returnTrackInfo() {

	var error = false;
	let trackId = document.getElementById('trackID').value;
	if ((trackId === '') || (Number.isNaN(trackId))) {
		document.getElementById('trackInfo').value = 'Please enter a numeric track ID.';
		error = true;
	}
	if (error === false) {
		let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
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
		})
		.catch(error => {
			console.error("Error executing script:", error);
			document.getElementById('trackInfo').value = error;
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

	class ReleaseDataDiscogs {
	
		constructor(url, trackCounter) {
			this.url = url;
			this.trackCounter = trackCounter;
			this.artist = getDiscogsArtist();
			this.album = getDiscogsAlbum();
			this.label = getDiscogsLabel();
			this.year = getDiscogsYear();
			this.trackName = getDiscogsTrackName(this.trackCounter, this.artist);
			this.trackArtist = getDiscogsTrackArtist(this.trackCounter, this.artist);
		}
	}

	class ReleaseDataBandcamp {
	
		constructor(url, trackCounter) {
			this.url = url;
			this.trackCounter = trackCounter;
			this.artist = getBandcampArtist();
			this.album = getBandcampAlbum();
			this.label = getBandcampLabel();
			this.year = getBandcampYear();
			this.trackName = getBandcampTrackName(this.trackCounter, this.artist);
			this.trackArtist = getBandcampTrackArtist(this.trackCounter, this.artist);
		}
	}

	class ReleaseData {
	
		constructor(url, trackCounter) {
			this.url = url;
			this.trackCounter;
			if (this.url == 'www.discogs.com') { 
				this.releaseObject = new ReleaseDataDiscogs(url, trackCounter);
			}	
			if (this.url.includes('bandcamp.com')) { 
				this.releaseObject = new ReleaseDataBandcamp(url, trackCounter);
			}
		}
		
		pageType() {
			if (this.url == 'www.discogs.com') { 
				return 'Discogs';
			}	
			if (this.url.includes('bandcamp.com')) { 
				return 'Bandcamp';
			}
		}
	}
	
	function removeDiscogsParens(dataString) {
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

	function getDiscogsArtist() {

		let artistAlbum = document.getElementsByTagName('h1')[0];
		let artistAlbumText = artistAlbum.innerText;
		let hyphen = String.fromCharCode(8211); // Discogs uses the en-dash, unicode #8211
		var artist = removeDiscogsParens(artistAlbum.innerText.split(' ' + hyphen + ' ')[0]);
		if (artist[artist.length - 1] === '*') {
			artist = artist.slice(0, -1);
		}
		return artist;
	}

	function getDiscogsTrackName(trackCounter, artist) {

		let trackTable = document.getElementsByClassName('tracklist_ZdQ0I')[0];
		if (trackCounter > trackTable.rows.length) {
			return '';
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
				}
			}
		}
		return trackName;
	}

	function getDiscogsTrackArtist(trackCounter, artist) {

		console.error('artist: ' + artist);
		let trackTable = document.getElementsByClassName('tracklist_ZdQ0I')[0];
		if (trackCounter > trackTable.rows.length) {
			return '';
		}
		var currentTrack = 0;
		let trackNumber = trackCounter - 1;
		var trackName = '';
		for (let trackTableIndex = 0; trackTableIndex < trackTable.rows.length; trackTableIndex++) {
			let rowData = trackTable.rows[trackTableIndex];
			if (rowData.hasAttribute('data-track-position')) {
				currentTrack++;
				if ((currentTrack - trackCounter) === 0) {
					if (artist === 'Various') {
						var trackArtist = rowData.getElementsByTagName('a')[0].innerText;
					} else {
						var trackArtist = artist;
					}
				}
			}
		}
		return trackArtist;
	}

	function getDiscogsAlbum() {

		let artistAlbum = document.getElementsByTagName('h1')[0];
		let artistAlbumText = artistAlbum.innerText;
		let hyphen = String.fromCharCode(8211); // Discogs uses the en-dash, unicode #8211
		var album = artistAlbum.innerText.split(' ' + hyphen + ' ')[1];
		return album;
	}

	function getDiscogsLabel() {

		let releaseInfo = document.getElementsByClassName('table_c5ftk')[0];
		let releaseLabel = removeDiscogsParens(releaseInfo.rows[0].getElementsByTagName('td')[0].innerText);
		return releaseLabel;
	}

	function getDiscogsYear() {

		let releaseInfo = document.getElementsByClassName('table_c5ftk')[0];
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
		return releaseYear;
	}

	function getBandcampArtist() {

		var artistAlbum = document.querySelector("meta[name='title']").getAttribute("content");
		var artist = artistAlbum.split(', by ')[1];
		return artist;
	}

	function getBandcampTrackName(trackCounter, artist) {

		console.error(trackCounter + ' | ' + artist);
		var pageType = document.querySelector("meta[property='og:type']").getAttribute("content");
		if (pageType == 'album') {
			let trackTable = document.getElementById('track_table');
			if (trackCounter > trackTable.rows.length) {
				return '';
			}
			let rowData = trackTable.rows[trackCounter - 1];
			var trackName = rowData.getElementsByClassName('track-title')[0].innerText;
			if (trackName.includes(' - ')) {
				trackName = trackName.split(' - ')[1];
			}
			return trackName;
		}
		if (pageType == 'song') {
			var trackName = document.querySelector("meta[name='title']").getAttribute("content");
			trackName = trackName.split(', by ')[0];
			return trackName;
		}
	}

	function getBandcampTrackArtist(trackCounter, artist) {

		var pageType = document.querySelector("meta[property='og:type']").getAttribute("content");
		if (pageType == 'album') {
			let trackTable = document.getElementById('track_table');
			if (trackCounter > trackTable.rows.length) {
				return '';
			}
			let rowData = trackTable.rows[trackCounter - 1];
			var trackName = rowData.getElementsByClassName('track-title')[0].innerText;
			if (trackName.includes(' - ')) {
				var artist = trackName.split(' - ')[0];
			}
			return artist;
		}
		if (pageType == 'song') {
			var trackName = document.querySelector("meta[name='title']").getAttribute("content");
			trackName = trackName.split(', by ')[0];
			return artist;
		}
	}

	function getBandcampAlbum() {

		var artistAlbum = document.querySelector("meta[name='title']").getAttribute("content");
		var album = artistAlbum.split(', by ')[0];
		return album;
	}

	function getBandcampYear() {

		var metadata = document.getElementsByClassName('tralbum-credits')[0].innerText;
		var releaseDateText = metadata.split('released ')[1].split('\n')[0];
		let releaseDate = new Date(releaseDateText);
		var releaseYear = releaseDate.getFullYear();
		return releaseYear;
	}

	function getBandcampLabel() {

		var label = 'Bandcamp';
		var moreFrom = document.getElementsByClassName('back-link-text')[0];
		if (moreFrom != null) {
			label = moreFrom.innerText.split('more from\n')[1];
		}
		return label;
	}

	function getTrackName(trackCounter, artist) {

		if (window.location.hostname == 'www.discogs.com') { 
			return getDiscogsTrackName(trackCounter, artist);
		}	
		if (window.location.hostname.includes('bandcamp.com')) { 
			return getBandcampTrackName(trackCounter, artist);
		}	
	}

	if ((window.location.hostname == 'www.discogs.com')&&(!window.location.pathname.includes('release'))) {
		return 'Please select a release.';
	}

    else {
		const release = new ReleaseData(window.location.hostname, trackCounter);
		var artist = release.releaseObject.artist;
		var album = release.releaseObject.album;
		var trackName = release.releaseObject.trackName;
		var trackArtist = release.releaseObject.trackArtist;
		var label = release.releaseObject.label;
		var year = release.releaseObject.year;
		if (trackName === '') {
			return 'That track number does not exist on this release.';
		}

		let returnData = trackArtist + '\n' + trackName + '\n' + album + '\n' + label + '\n' + year;
		return returnData;
	}
}

console.log('Extension is starting!');

chrome.storage.local.get('trackInfo', function(result) {
	var trackInfo = result.trackInfo;
	if (trackInfo !== undefined) {
		document.getElementById('trackInfo').value = trackInfo;
	}
});
	
chrome.storage.local.get('setlist', function(result) {
	var setlist = result.setlist;
	if (setlist !== undefined) {
		document.getElementById('setlist').value = setlist;
	}
});

document.getElementById('getTrackInfo').addEventListener('click', returnTrackInfo);
document.getElementById('addToSetlist').addEventListener('click', addToSetlist);
document.getElementById('clearSetlist').addEventListener('click', clearSetlist);
document.getElementById('trackInfo').addEventListener('change', writeTrackInfoToStorage);
document.getElementById('setlist').addEventListener('change', writePlaylistToStorage);
