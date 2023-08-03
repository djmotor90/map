const myMap = {
	coordinates: [],
	businesses: [],
	map: {},
	markers: {},

	// build leaflet map
	buildMap() {
		this.map = L.map('map', {
			center: this.coordinates,
			zoom: 11,
		});
		// add openstreetmap tiles
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			minZoom: '15',
		}).addTo(this.map)
		// create and add geolocation marker
		const marker = L.marker(this.coordinates)
		marker
			.addTo(this.map)
			.bindPopup('<p1><b>You are here</b><br></p1>')
			.openPopup()

		// Add a click event to the map
		this.map.on('click', (e) => {
			let clickedMarker = L.marker(e.latlng, {
				icon: L.icon({
					iconUrl: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
					iconSize: [41, 41],
					iconAnchor: [12, 41],
				})
			}).addTo(this.map);

			clickedMarker.bindPopup("Lat : " + e.latlng.lat + ", " + "Long : " + e.latlng.lng).openPopup();
		});
	},

	// add business markers
	addMarkers() {
		for (var i = 0; i < this.businesses.length; i++) {
			this.markers = L.marker([
				this.businesses[i].lat,
				this.businesses[i].long,
			])
				.bindPopup(`<p1>${this.businesses[i].name}</p1>`)
				.addTo(this.map)
		}
	},

	// Add business marker
addBusinessMarker(businessName, coords) {
	const marker = L.marker(coords, {
		icon: L.icon({
			iconUrl: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
			iconSize: [41, 41],
			iconAnchor: [12, 41],
		})
	}).addTo(this.map);

	marker.bindPopup(businessName).openPopup();
}
}

// get coordinates via geolocation api
async function getCoords(){
	const pos = await new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(resolve, reject)
	});
	return [pos.coords.latitude, pos.coords.longitude]
}

// get foursquare businesses
async function getFoursquare(business) {
	const options = {
		method: 'GET',
		headers: {
		Accept: 'application/json',
		Authorization: 'fsq3pgMKgM+B/2NKnnQVucldbWH1hs784ompXIyLcTYqMpc='
		}
	}
	let limit = 5
	let lat = myMap.coordinates[0]
	let lon = myMap.coordinates[1]
	let response = await fetch(`https://api.foursquare.com/v3/places/search?&query=${business}&limit=${limit}&ll=${lat}%2C${lon}`, options)
	let data = await response.text()
	let parsedData = JSON.parse(data)
	let businesses = parsedData.results
	return businesses
}
// process foursquare array
function processBusinesses(data) {
	let businesses = data.map((element) => {
		let location = {
			name: element.name,
			lat: element.geocodes.main.latitude,
			long: element.geocodes.main.longitude
		};
		return location
	})
	return businesses
}

// event handlers
// window load
window.onload = async () => {
	const coords = await getCoords()
	myMap.coordinates = coords
	myMap.buildMap()
}

// business submit button
document.getElementById('submit').addEventListener('click', async (event) => {
	event.preventDefault()
	let business = document.getElementById('business').value
	let data = await getFoursquare(business)
	myMap.businesses = processBusinesses(data)
	myMap.addMarkers()
})

// business name submit button
document.getElementById('businessSubmit').addEventListener('click', async (event) => {
	event.preventDefault()
	let businessName = document.getElementById('businessName').value
	let data = await getFoursquare(businessName)
	myMap.businesses = processBusinesses(data)
	if (myMap.businesses.length > 0) {
		// Assumes the first returned business is the correct one
		let business = myMap.businesses[0]
		myMap.addBusinessMarker(business.name, [business.lat, business.long])
	} else {
		console.log('No businesses found with the specified name')
	}
})