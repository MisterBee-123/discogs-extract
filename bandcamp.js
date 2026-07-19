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

function getBandcampArtist() {

	var artistAlbum = document.querySelector("meta[name='title']").getAttribute("content");
	var artist = artistAlbum.split(', by ')[1];
	return artist;
}

function getBandcampTrackName(trackCounter, artist) {

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

export default ReleaseDataBandcamp;
