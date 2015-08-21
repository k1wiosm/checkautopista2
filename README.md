# CheckAutopista2

Live demo: http://checkautopista.hol.es/

_For the original CheckAutopista see: http://github.com/k1wiosm/checkautopista_

![](https://raw.githubusercontent.com/k1wiosm/checkautopista2/master/img/example.png)

CheckAutopista is a quality assurance tool for motorways in OpenStreetMap. This tools can check any motorway in the world. CheckAutopista only works with motorways gathered in a relation tagged as ```type=route``` and ```route=road```. Also the motorway ways need to tagged as ```highway=motorway``` or ```highway=motorway_link```.

##Quality Assurance

You can choose a motorway by relationID or from the map and it shows:

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

* [London M25](http://checkautopista.hol.es/?id=106164&lat=51.5049&lon=-0.3948&z=10)
* [Interstate 15 in California](http://checkautopista.hol.es/?id=2211488&lat=34.1868&lon=-117.8146&z=8)
* [Autovía Cantabria - Meseta (A-67) in Spain](http://checkautopista.hol.es/?id=4071813&lat=42.8629&lon=-4.4206&z=9)
