This is a simple Google Maps class that addresses the following common issues I run into:

- Allows you to map both addresses and coordinates at the same time.
- Combats the 620 (too many requests) geocoding error by passing each address to the geocoder with a configurable delay, and will
continue to re-try the address until any other status code is returned.
- Re-centers and re-adjusts the zoom level after all points are on the map.
- Abstracts the code into a class, making it easy and DRY'er to use multiple maps on the same page. 
- Provides three callbacks (onLoad, onProcess, and onComplete) allowing you to tap into each "phase" of the mapping process.
