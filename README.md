# CheckAutopista2

Live demo: http://k1wiosm.github.io/checkautopista2/

_For the original CheckAutopista see: http://github.com/k1wiosm/checkautopista_

![](https://raw.githubusercontent.com/k1wiosm/checkautopista2/master/img/example.png)

CheckAutopista is a quality assurance tool for motorways in OpenStreetMap. This tools can check any motorway in the world. CheckAutopista only works with motorways gathered in a relation tagged as ```type=route``` and ```route=road```. Also the motorway ways need to tagged as ```highway=motorway``` or ```highway=motorway_link```.

##How to use

1. Go to http://k1wiosm.github.io/checkautopista2/
2. Zoom in to the motorway you want to analyze
3. Open search tab (![](https://raw.githubusercontent.com/k1wiosm/checkautopista2/master/img/search_tab.png))
4. Click on the Search in map button (![](https://raw.githubusercontent.com/k1wiosm/checkautopista2/master/img/search_in_map.png))
5. Select desired motorway from dropdown
6. Click Download button (![](https://raw.githubusercontent.com/k1wiosm/checkautopista2/master/img/download.png))

##Quality Assurance

You can choose a motorway from the map and it shows:

* Ways
  * maxspeed
  * lanes
* Exit nodes
  * highway=motorway_junction 
  * ref
  * destination
    * destination:ref
    * destination:int_ref
  * exit_to
  * name
* Tollbooths
* Service and Rest Areas

##Examples

* [London M25](http://k1wiosm.github.io/checkautopista2/?id=106164&lat=51.5049&lon=-0.3948&z=10)
* [Interstate 15 in California](http://k1wiosm.github.io/checkautopista2/?id=2211488&lat=34.1868&lon=-117.8146&z=8)
* [Autovía Cantabria - Meseta (A-67) in Spain](http://k1wiosm.github.io/checkautopista2/?id=4071813&lat=42.8629&lon=-4.4206&z=9)
* [Bundesautobahn 3](http://k1wiosm.github.io/checkautopista2/?id=2925465&lat=50.1875&lon=7.5641&z=7)

##Credits

* Data ODbL from © [OpenStreetMap](http://www.openstreetmap.org/) contributors
* Data obtained with [Overpass API](http://wiki.openstreetmap.org/wiki/Overpass_API)
* Background map designed with [Mapbox](http://www.mapbox.com/)
* [Leaflet](http://leafletjs.com/)
* [sidebar-v2](http://github.com/turbo87/sidebar-v2/)
* [font-awesome](http://fortawesome.github.io/Font-Awesome/)
* [purl](http://github.com/allmarkedup/jQuery-URL-Parser)
* [js-cookie](https://github.com/js-cookie/js-cookie)
* [jQuery](http://jquery.com)
* [jQuery UI](http://jqueryui.com/)
