require('dotenv').config();
const port = 3000;

const express = require('express');
const hbs = require('hbs');
const path = require('path');

// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

hbs.registerPartials(path.join(__dirname, 'views/partials'));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
	clientId: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
});
spotifyApi
	.clientCredentialsGrant()
	.then((data) => spotifyApi.setAccessToken(data.body['access_token']))
	.catch((error) => console.log('Something went wrong when retrieving an access token', error));

// Our routes go here:

app.get('/', (req, res) => {
	res.render('index');
});

app.get('/artist-search', (req, res) => {
	spotifyApi
		.searchArtists(req.query.artist)
		.then((data) => {
			let allArtists = data.body.artists.items;

			res.render('artist-search-results', { allArtists });
		})
		.catch((err) => console.log('The error while searching artists occurred: ', err));
});

app.get('/albums/:id', (req, res, next) => {
	spotifyApi.getArtistAlbums(req.params.id).then((data) => {
		console.log(data.body);
		let artistName = data.body.items[0].artists[0].name;
		let allAlbums = { artistName: artistName, albums: data.body.items };
		res.render('albums', { allAlbums });
	});
});

app.get('/tracks/:id', (req, res, next) => {
	spotifyApi.getAlbumTracks(req.params.id).then((data) => {
		let allTracks = data.body.items;

		res.render('tracks', { allTracks });
	});
});

app.listen(port, () => console.log(`My Spotify project running on port ${port} 🎧 🥁 🎸 🔊`));
