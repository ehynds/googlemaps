var GoogleMap = function(options){
	options = options || {};
	
	var map, bounds, counter = options.locations.length, geo = new GClientGeocoder(), points = 0;

	// initializes the google map
	var init = function(){
		map = new GMap2(document.getElementById(options.id));
		map.setCenter(new GLatLng(options.defaultCenter[0], options.defaultCenter[1]), options.defaultCenter[2]);
		map.setUIToDefault();
		map.setMapType(options.type);
		bounds = new GLatLngBounds();
	};
	
	// geocodes an address
	var geocode = function( address, html ){
		
		// send the address to the geocoder in a timer to prevent the G_GEO_TOO_MANY_QUERIES error
		setTimeout(function(){
			geo.getLocations(address, function(result){ 
				var statusCode = result.Status.code;
				
				// call the process callback passing in the status code
				options.onProcess.call( map, address, statusCode );
				
				// if the geocode was successful
				if(statusCode === 200){
					var place = result.Placemark[0], coords = place.Point.coordinates, latitude = coords[1], longitude = coords[0];
					
					// send the coords into the mapper
					addToMap(latitude, longitude, html);
			
				// if we overloaded the geocoder, retry this one again
				} else if (statusCode === 620){
					counter++;
				}
				
				// keep processing if the point never made it to the map.
				if(statusCode !== 200){
					process();
				}
			});
		}, options.delay);
	};
	
	// adds a point to the map
	var addToMap = function( latitude, longitude, html ){
		var point = new GLatLng(latitude,longitude), marker = createMarker(point,html);
		bounds.extend(point);
		map.addOverlay(marker);
		points++;
		
		// keep processing
		process();
	};
	
	// creates an info marker
	var createMarker = function( point, html ){
		var marker = new GMarker(point);
		GEvent.addListener(marker, "click", function(){
			marker.openInfoWindowHtml(html);
		});
		return marker;
	};
	
	var process = function(){
		counter--;
		var coords, location = options.locations[ counter ];
		
		// once all the points are on the map, re-center/zoom it and bail
		if(counter < 0){
			map.setCenter(bounds.getCenter(), map.getBoundsZoomLevel(bounds));
			options.onComplete.call( map, points );
			return;
		}
		
		// create the google map instance on the first call
		if(typeof map === 'undefined'){
			options.onLoad.call( map, options.locations );
			init();
		}
		
		// is this location an address?
		if(location.length === 2){
			geocode(location[0],location[1]);
			
		// otherwise it's coords
		} else {
			coords = location.slice(0,2);
			options.onProcess.call( map, coords );
			addToMap( coords[0], coords[1], location[2] );
		}
	};

	return {
		load:process,
		options:options
	};
};

