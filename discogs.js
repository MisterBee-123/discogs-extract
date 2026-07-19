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
