# CheckAutopista2

http://checkautopista.hol.es/

For the original CheckAutopista see: http://github.com/k1wiosm/checkautopista

CheckAutopista is a quality assurance tool for motorways in OpenStreetMap. This tools can check any motorway in the world. CheckAutopista only works with motorways gathered in a relation with ```type=route``` and ```route=road```. Also the motorway ways need to tagged as ```highway=motorway``` or ```highway=motorway_link```.

##Quality Assurance

You can choose a motorway by relationID or from the map and it checks the following information:

* name
* ref
* maxspeed
* lanes

On the exits it checks:

* ref
* destination
* exit_to
* name

Also it shows information about the tollbooths and the service and rest areas.

