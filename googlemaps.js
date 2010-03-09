var GoogleMap = function( options ){

	// param the options
	options = options || {};
	
	// see http://code.google.com/apis/maps/documentation/reference.html#GMapOptions
	options.GMapOptions = {};
	
	options.type = options.type || G_NORMAL_MAP;
	options.controls = options.controls || true;
	options.scrollWheelZoom = options.scrollWheelZoom || false;
	options.delay = options.delay || 100;
	options.defaultCenter = options.defaultCenter || [37.0625, -95.677068];
	options.defaultZoom = options.defaultZoom || 3;
	options.maxZoomLevel = 30;
	options.locations = options.locations || [];
	options.onLoad = options.onLoad || function(){};
	options.onProcess = options.onProcess || function(){};
	options.onComplete = options.onComplete || function(){};
	options.template = "";
	
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
					
				// if we overloaded the geocoder change the counter to retry this one again
				} else if (statusCode === 620){
					counter++;
				}
				
				// keep processing as long as anything other than 200 was returned.
				// note that if a 620 occured, calling process() will retry said point
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
		
		// only bind the click event if there is something in the info window
		if(html.replace(/^\s+|\s+$/g, '').length > 0){
			GEvent.addListener(marker, "click", function(){
				marker.openInfoWindowHtml(html);
			});
		}
		
		return marker;
	};
	
	var process = function(){
		counter--;
		
		// once all the points are on the map, re-center/zoom it and bail
		if(counter < 0){
			var zoomlevel = map.getBoundsZoomLevel(bounds);
			zoomlevel = (zoomlevel > options.maxZoomLevel) ? options.maxZoomLevel : zoomlevel;
			
			map.setCenter(bounds.getCenter(), zoomlevel);
			
			// TODO - pass in an array of all successful points
			options.onComplete.call( map, points );
			return;
		}
		
		var coords, location = options.locations[ counter ];
		
		// param the last item as an object (template vars)
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
			bounds = new GLatLngBounds();
			map = new GMap2(document.getElementById(options.id), options.GMapOptions);
			map.setMapType(options.type);
			map.setCenter(new GLatLng(options.defaultCenter[0], options.defaultCenter[1]), options.defaultZoom);
			
			if(options.controls){
				map.setUIToDefault();
			
				// in case you want to use scroll wheel zoom w/o controls
				if(options.scrollWheelZoom){
					map.enableScrollWheelZoom();
				}
			}

			// how many points do we have?
			counter = options.locations.length;
			
			// fire the onload callback
			options.onLoad.call( map, options.locations );
			
			if(options.locations.length){
				process();
			}
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


