var GoogleMap = function( options ){

	// param the options
	options = options || {};
	options.type = options.typle || G_NORMAL_MAP;
	options.delay = options.delay || 100;
	options.defaultCenter = options.defaultCenter || [0,0];
	options.locations = options.locations || [];
	options.onLoad = options.onLoad || function(){};
	options.onProcess = options.onProcess || function(){};
	options.onComplete = options.onComplete || function(){};
	
	var map, geo, bounds, points = 0, counter = 0;
	
	// geocodes an address
	var geocode = function( address, params ){
		
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
					addToMap(latitude, longitude, params);
			
				// if we overloaded the geocoder, retry this one again
				} else if (statusCode === 620){
					counter++;
				}
				
				// keep processing if the point isn't legit.
				if(statusCode !== 200){
					process();
				}
			});
		}, options.delay);
	};
	
	// adds a point to the map
	var addToMap = function( latitude, longitude, params ){
		var point = new GLatLng(latitude,longitude), marker = createMarker( point, params );
		
		bounds.extend(point);
		map.addOverlay(marker);
		points++;
		
		// keep processing
		process();
	};
	
	// creates an info marker
	var createMarker = function( point, params ){
		var marker = new GMarker(point);
		var html = options.template.replace(/#\{(.*?)\}/g, function($1, $2){
			return ($2 in params) ? params[$2] : '';
		});
		
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
		
		// param the last item as an object
		if(typeof location[location.length-1] !== 'object'){
			location.push({});
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
		draw: function(){
			geo = new GClientGeocoder();
			map = new GMap2(document.getElementById(options.id));
			map.setCenter(new GLatLng(options.defaultCenter[0], options.defaultCenter[1]), options.defaultCenter[2]);
			map.setUIToDefault();
			map.setMapType(options.type);
			bounds = new GLatLngBounds();
			
			// how many points do we have?
			counter = options.locations.length;
			
			// fire the onload callback
			options.onLoad.call( map, options.locations );
			
			process();
		},
		
		setOption: function( key, val ){
			options[key] = val;
		},
		
		addPoint: function( lon, lat, params ){
			options.locations.push(Array.prototype.slice.call(arguments));
		},
		
		options: options
	};
};


