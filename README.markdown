# Google Maps

This is a simple Google Maps script that addresses the following common issues I run into:

- Ability to map both addresses and coordinates at the same time.
- Combats the 620 (too many requests) geocoding error by passing each address to the geocoder with a configurable delay, and will
continue to re-try the address until any other status code is returned.
- Basic InfoWindowHtml HTML templating.
- Re-centers and re-adjusts the zoom level after all points are on the map.
- Provides three callbacks (onLoad, onProcess, and onComplete) allowing you to tap into each "phase" of the mapping process.

## Additional features

- Use multiple maps on the same page.
- Info window click event is only bound if there is info to display.
- Most common Google Map options are available: change map type, toggle controls, scrollWheelZoom, etc.
- Configure a maximum zoom level for when the map re-centers and re-zoom's itself (useful if the points are added dynamically).

## Usage

See the source for available options.

	// pass an object literal of options to the constructor  
	var map = new GoogleMap({ /* options here */ });
	
	// alternative syntax
	var map = new GoogleMap();
	map.setOption('name', 'value');
	map.addPoint('some address', { /* info window template vars */ });
	map.addPoint('longitude', 'latitude', {  /* info window template vars */ });
	
## Templating

This module comes with a real basic templating system (variable replacement only) for info windows.  Usage:

	var map = new GoogleMap({
		template: '<h1>#{city}</h1><p>Visit <a href="http://#{url}">#{city}</a> for #{coolness}',
		
		locations: [
			['Boston, MA', {
				city: 'Boston',
				url: 'www.boston.com',
				coolness: 'baked beans'
			}],
			['Burlington, VT', {
				city: 'Burlington',
				url: 'www.burlingtonvt.com',
				coolness: 'skiing'
			}]
		]
	});
	
## Callbacks

Three callbacks are available:

onLoad fires when draw() is called:

	onLoad: function(locations){
	
		// 'this' is the Google Maps object
		// 'locations' parameter is the array of locations to map

	}
	
onComplete fires when all points in options.locations have been processed:
	
	onComplete: function(points){ 
		// 'this' is the Google Maps object
		// 'points' parameter is the number of points that successfully made it onto the map
	};

onProcess fires right after a point has been geocoded (if the point is an address), or right before the point is added to the map (if the point is coords).

	onProcess: function(location, statusCode){
		statusCode = statusCode || 'This location was not geocoded.';
	
		// 'this' is the Google Maps object
		// 'location' parameter is the point
		// 'statusCode' parameter is the status code returned from the geocoder (if applicable)
	};
	
## Todo

Some things I still need to address:

- Custom icons
- Update to v3?



