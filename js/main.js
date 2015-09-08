console.log('CheckAutopista debugging');

var map = L.map('map', {
	center: [options.lat || 40.179, options.lon || -4.482],
	zoom: options.z || 6});

if (options.lat==undefined && options.lon==undefined && options.z==undefined && options.id==undefined) {
	map.locate({
		setView:true,
		maxZoom:12});
}

a=L.tileLayer(
	'http://api.tiles.mapbox.com/v4/k1wi.800a80e3/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiazF3aSIsImEiOiJaX0JKRUNzIn0.yL_KftGNvh631-_yDzotcQ', {
		attribution: '<a href="http://openstreetmap.org" title="OpenStreetMap">OSM</a> | <a href="http://mapbox.com" title="Tiles by Mapbox">Mapbox</a> ',
		maxZoom: 18})
	.addTo(map);

var sidebar = L.control.sidebar('sidebar').addTo(map);

updateLegend();

if (options.id!==undefined) { 
	if (options.lat==undefined&&options.lon==undefined&&options.z==undefined) { getFreeway(options.id, {zoom: true}); 
	} else { getFreeway(options.id); };
};

map.on('dragend', function(e) { updatePermalink(undefined, map.getCenter().lat, map.getCenter().lng, map.getZoom()); });
map.on('zoomend', function(e) { updatePermalink(undefined, map.getCenter().lat, map.getCenter().lng, map.getZoom()); });


window.onbeforeunload = function (e) {
	killRequests();
};

function updatePermalink (relID, lat, lon, z) {
	options.lat = (lat || options.lat) ? Number(lat || options.lat).toFixed(4) : undefined;
	options.lon = (lon || options.lon) ? Number(lon || options.lon).toFixed(4) : undefined;
	options.z = z || options.z;
	options.relID = relID || options.relID;
	url = '';
	options.view = '';
	if ($('#tolls .chk')[0].checked) { options.view += 't'; };
	if ($('#exDest .chk')[0].checked) { options.view += 'd'; };
	if ($('#exExitTo .chk')[0].checked) { options.view += 'e'; };
	if ($('#exName .chk')[0].checked) { options.view += 'n'; };
	if ($('#exNone .chk')[0].checked) { options.view += 'x'; };
	if ($('#exUnmarked .chk')[0].checked) { options.view += 'u'; };
	if ($('#exRef .chk')[0].checked) { options.view += 'r'; };
	if ($('#exNoRef .chk')[0].checked) { options.view += 'o'; };
	if ($('#areas .chk')[0].checked) { options.view += 'a'; };
	if ($('#wAll .chk')[0].checked) { options.view += 'A' };
	if ($('#wNoLanes .chk')[0].checked) { options.view += 'L'; };
	if ($('#wNoMaxspeed .chk')[0].checked) { options.view += 'M' };
	if ($('#wNone .chk')[0].checked) { options.view += 'X'; };
	if (options.view=='') { options.view='-' };
	if (options.relID) { url += '&id='+options.relID; };
	if (options.lat) { url += '&lat='+options.lat; };
	if (options.lon) { url += '&lon='+options.lon; };
	if (options.z) { url += '&z='+options.z; };
	if (options.view!=='tdenxuaALMX') { url += '&view='+options.view; };
	url=url.replace('&','?');
	window.history.replaceState('', '', url);
}

function updateLegend () {
	if (options.view.indexOf('t')==-1) { $('#tolls .chk').prop('checked', false); } else { $('#tolls .chk').prop('checked', true); };
	if (options.view.indexOf('d')==-1) { $('#exDest .chk').prop('checked', false); } else { $('#exDest .chk').prop('checked', true); };
	if (options.view.indexOf('e')==-1) { $('#exExitTo .chk').prop('checked', false); } else { $('#exExitTo .chk').prop('checked', true); };
	if (options.view.indexOf('n')==-1) { $('#exName .chk').prop('checked', false); } else { $('#exName .chk').prop('checked', true); };
	if (options.view.indexOf('x')==-1) { $('#exNone .chk').prop('checked', false); } else { $('#exNone .chk').prop('checked', true); };
	if (options.view.indexOf('u')==-1) { $('#exUnmarked .chk').prop('checked', false); } else { $('#exUnmarked .chk').prop('checked', true); };
	if (options.view.indexOf('r')==-1) { $('#exRef .chk').prop('checked', false); } else { $('#exRef .chk').prop('checked', true); };
	if (options.view.indexOf('o')==-1) { $('#exNoRef .chk').prop('checked', false); } else { $('#exNoRef .chk').prop('checked', true); };
	if (options.view.indexOf('a')==-1) { $('#areas .chk').prop('checked', false); } else { $('#areas .chk').prop('checked', true); };
	if (options.view.indexOf('A')==-1) { $('#wAll .chk').prop('checked', false); } else { $('#wAll .chk').prop('checked', true); };
	if (options.view.indexOf('L')==-1) { $('#wNoLanes .chk').prop('checked', false); } else { $('#wNoLanes .chk').prop('checked', true); };
	if (options.view.indexOf('M')==-1) { $('#wNoMaxspeed .chk').prop('checked', false); } else { $('#wNoMaxspeed .chk').prop('checked', true); };
	if (options.view.indexOf('X')==-1) { $('#wNone .chk').prop('checked', false); } else { $('#wNone .chk').prop('checked', true); };
}

function findWithAttr(array, attr, value) {
	for (var i in array) { if (array[i][attr] == value) { return array[i]; }; };
}
