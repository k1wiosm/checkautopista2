console.log('CheckAutopista debugging');

var map = L.map('map', {
	center: [options.lat || 40.179, options.lon || -4.482],
	zoom: options.z || 6});

if (options.lat==undefined && options.lon==undefined && options.z==undefined && options.id==undefined) {
	map.locate({
		setView:true,
		maxZoom:12});
}

tileCA2=L.tileLayer(
	'https://api.tiles.mapbox.com/v4/k1wi.7e678c5d/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiazF3aSIsImEiOiJaX0JKRUNzIn0.yL_KftGNvh631-_yDzotcQ', {
		attribution: '<a href="http://openstreetmap.org" title="OpenStreetMap">OSM</a> | <a href="http://mapbox.com" title="Tiles by Mapbox">Mapbox</a> ',
		maxZoom: 18});

tileOSM=L.tileLayer(
	'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '<a href="http://openstreetmap.org" title="OpenStreetMap">OSM</a>',
		maxZoom: 18});

tileMapillary=L.vectorGrid.protobuf(
	'https://d2munx5tg0hw47.cloudfront.net/tiles/{z}/{x}/{y}.mapbox', {
		rendererFactory: L.canvas.tile,
		maxZoom: 18,
		vectorTileLayerStyles: {
			'mapillary-sequences': {
				weight: 15,
				color: '#00b96f',
				opacity: 0.3,
				fill: true
			},
		}
	});

tile30USCities=L.tileLayer(
	'https://api.mapbox.com/styles/v1/planemad/cijwpzx4m00ofcakw1m0f1ir1/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiemdYSVVLRSJ9.g3lbg_eN0kztmsfIPxa9MQ', {
		maxZoom: 18});

updateTiles();

var sidebar = L.control.sidebar('sidebar').addTo(map);

updateLegend();

if (options.id!==undefined) { 
	if (options.lat==undefined&&options.lon==undefined&&options.z==undefined) { loadFreeway(options.id, {zoom: true}); 
	} else { loadFreeway(options.id); };
};

map.on('dragend', function(e) { updatePermalink(undefined, map.getCenter().lat, map.getCenter().lng, map.getZoom()); });
map.on('zoomend', function(e) { updatePermalink(undefined, map.getCenter().lat, map.getCenter().lng, map.getZoom()); });

$(document).ready(function() {
	$('div#searchByID input').keyup(function() {
		// Disable download when input is empty
		$('div#searchByID button.download').prop('disabled', $('div#searchByID input').val().length == 0);
	});
	$('div#searchByProp input').keyup(function() {
		// Disable search when input is empty
		$('div#searchByProp button.search').prop('disabled', $('div#searchByProp input#name').val().length + $('div#searchByProp input#ref').val().length + 
			$('div#searchByProp input#network').val().length + $('div#searchByProp input#operator').val().length == 0);
	});

	window.onbeforeunload = function (e) {
		killRequests();
	};
	window.onunload = function (e) {
		killRequests();
	};

	$('div#searchInMap button.download,div#searchInMap select').prop('disabled', $('div#searchInMap select >').length == 0);
	$('div#searchByID button.download').prop('disabled', $('div#searchByID input').val().length == 0);
	$('div#searchByProp button.download,div#searchByProp select').prop('disabled', $('div#searchByProp select >').length == 0);

	Mousetrap.bind('k', function(e) {
		if (way[options.wayID] && way[options.wayID].prev[0]) {
			way[options.wayID].prev[0].sidebar();
			way[options.wayID].prev[0].zoom();
		} else if (node[options.nodeID] && node[options.nodeID].prev[0]) {
			node[options.nodeID].prev[0].sidebar();
			node[options.nodeID].prev[0].zoom();
		};
	});
	Mousetrap.bind('j', function(e) {
		if (way[options.wayID] && way[options.wayID].next[0]) {
			way[options.wayID].next[0].sidebar();
			way[options.wayID].next[0].zoom();
		} else if (node[options.nodeID] && node[options.nodeID].next[0]) {
			node[options.nodeID].next[0].sidebar();
			node[options.nodeID].next[0].zoom();
		};
	});
});

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
	if ($('#exNoRefYes .chk')[0].checked) { options.view += 'y'; };
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
	if (options.view.indexOf('y')==-1) { $('#exNoRefYes .chk').prop('checked', false); } else { $('#exNoRefYes .chk').prop('checked', true); };
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

function updateTiles(clicked) {
	// Updates tiles visibility in options object

	if (typeof clicked !== undefined) {
		var id = $(clicked).parent().parent().attr('id');
		if (id=='tileCA2') {
			options.tiles.push('tileCA2');
			options.tiles.splice(options.tiles.indexOf('tileOSM'), 1);
		};
		if (id=='tileOSM') {
			options.tiles.push('tileOSM');
			options.tiles.splice(options.tiles.indexOf('tileCA2'), 1);
			$('#tileCA2 .chk').prop('checked', false);
		};
		if (id=='tileMapillary') {
			if ($('#tileMapillary .chk').prop('checked')) {
				options.tiles.push('tileMapillary');
			} else {
				options.tiles.splice(options.tiles.indexOf('tileMapillary'), 1);
			}
		};
		if (id=='tile30USCities') {
			if ($('#tile30USCities .chk').prop('checked')) {
				options.tiles.push('tile30USCities');
			} else {
				options.tiles.splice(options.tiles.indexOf('tile30USCities'), 1);
			}
		};
	};

	showTiles();
	updateCookies();
}

function showTiles() {
	// Updates the map tiles & menu according to options object

	if (options.tiles.indexOf('tileCA2')!==-1) {
		$('#tileCA2 .chk').prop('checked', true);
		$('#tileOSM .chk').prop('checked', false);
		map.removeLayer(tileOSM);
		map.addLayer(tileCA2);
	};
	if (options.tiles.indexOf('tileOSM')!==-1) {
		$('#tileCA2 .chk').prop('checked', false);
		$('#tileOSM .chk').prop('checked', true);
		map.removeLayer(tileCA2);
		map.addLayer(tileOSM);
	};
	if (options.tiles.indexOf('tileMapillary')!==-1) {
		$('#tileMapillary .chk').prop('checked', true);
		map.addLayer(tileMapillary);
	} else {
		$('#tileMapillary .chk').prop('checked', false);
		map.removeLayer(tileMapillary);
	};
	if (options.tiles.indexOf('tile30USCities')!==-1) {
		$('#tile30USCities .chk').prop('checked', true);
		map.addLayer(tile30USCities);
	} else {
		$('#tile30USCities .chk').prop('checked', false);
		map.removeLayer(tile30USCities);
	};
}
