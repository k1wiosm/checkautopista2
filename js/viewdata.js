function Analysis() {
	this.exTotal = undefined;
	this.exRef = undefined;
	this.exNoRef = undefined;
	this.exNoRefYes = undefined;
	this.exName = undefined;
	this.exExitTo = undefined;
	this.exDest = undefined;
	this.exDir = undefined;
	this.exUnmarked = undefined;
	this.tollBooths = undefined;
	this.tollGantrys = undefined;
	this.areas = undefined;
}

Freeway.prototype.getAnalysis = function () {
	//Exits and other nodes
	var exRef = 0;
	var exNoRefYes = 0;
	var exName = 0;
	var exExitTo = 0;
	var exDest = 0;
	var exDir = 0;
	for (var i = 0; i < this.exits.length; i++) {
		if (this.exits[i].tags.ref!=undefined) { exRef++;
		} else if (this.exits[i].tags.noref=='yes') { exNoRefYes++; };
		if (this.exits[i].tags.name!=undefined) { exName++; };
		if (this.exits[i].tags.exit_to!=undefined) { exExitTo++; };
		if (this.exits[i].hasDestination()) { exDest++; };
		if (this.exits[i].tags.name!=undefined || 
			this.exits[i].tags.exit_to!=undefined || 
			this.exits[i].hasDestination()) { exDir++; };
	};
	this.analysis.exTotal = this.exits.length;
	this.analysis.exRef = exRef;
	this.analysis.exNoRefYes = exNoRefYes;
	this.analysis.exNoRef = this.exits.length - exRef - exNoRefYes;
	this.analysis.exName = exName;
	this.analysis.exExitTo = exExitTo;
	this.analysis.exDest = exDest;
	this.analysis.exDir = exDir;
	this.analysis.exUnmarked = this.unmarked.length;
	this.analysis.tollBooths = this.tollBooths.length;
	this.analysis.tollGantrys = this.tollGantrys.length;
	this.analysis.areas = this.areasNode.length+this.areasWay.length;
	// Show
	this.addToMap();
	// Ways
	var wAll = 0;
	var wNoLanes = 0;
	var wNoMaxspeed = 0;
	var wNone = 0;
	for (var i = 0; i < this.waysIDs.length; i++) {
		if(way[this.waysIDs[i]].tags==undefined || 
			way[this.waysIDs[i]].tags.lanes==undefined && 
			way[this.waysIDs[i]].tags.maxspeed==undefined &&
			way[this.waysIDs[i]].tags['maxspeed:lanes']==undefined) { wNone += way[this.waysIDs[i]].getLength(); 
		} else if (way[this.waysIDs[i]].tags.lanes==undefined) { wNoLanes += way[this.waysIDs[i]].getLength(); 
		} else if (way[this.waysIDs[i]].tags.maxspeed==undefined &&
			       way[this.waysIDs[i]].tags['maxspeed:lanes']==undefined) { wNoMaxspeed += way[this.waysIDs[i]].getLength(); 
		} else { wAll += way[this.waysIDs[i]].getLength(); };
	};
	this.analysis.wAll = wAll;
	this.analysis.wNoLanes = wNoLanes;
	this.analysis.wNoMaxspeed = wNoMaxspeed;
	this.analysis.wNone = wNone;
	this.analysis.wTotal = wAll+wNoLanes+wNoMaxspeed+wNone;
	// Show
	this.addToSidebar();
}

Freeway.prototype.addToMap = function() {
	// Clear Map
	if (typeof mapDataLayer !== 'undefined') { map.removeLayer(mapDataLayer); };
	mapDataLayer = L.layerGroup();
	// Ways
	for (var i = 0; i < this.waysIDs.length; i++) {
		var latlngs = [];
		for (var j = 0; j < way[this.waysIDs[i]].nodes.length; j++) {
			latlngs.push({
				lat:node[way[this.waysIDs[i]].nodes[j]].lat, 
				lng:node[way[this.waysIDs[i]].nodes[j]].lon});
		};
		var polyline = L.polyline(latlngs, styleWay(way[this.waysIDs[i]].tags));
		polyline.element = way[this.waysIDs[i]];
		polyline.type = 'polyline';
		way[this.waysIDs[i]].polyline = polyline;
		mapDataLayer.addLayer(polyline);
	};
	//Areas
	for (var i = 0; i < this.areasWay.length; i++) {
		var latlngs = [];
		for (var j = 0; j < way[this.areasWay[i].wayID].nodes.length; j++) {
			latlngs.push({
				lat:node[way[this.areasWay[i].wayID].nodes[j]].lat, 
				lng:node[way[this.areasWay[i].wayID].nodes[j]].lon});
		};
		var polygon = L.polygon(latlngs, styleWay(way[this.areasWay[i].wayID].tags));
		polygon.element = way[this.areasWay[i].wayID];
		polygon.type = 'polygon';
		way[this.areasWay[i].wayID].polygon = polygon;
		mapDataLayer.addLayer(polygon);
		var marker = L.circleMarker({lat:this.areasWay[i].center.lat, lng:this.areasWay[i].center.lon}, 
			styleNode(this.areasWay[i]));
		marker.element = way[this.areasWay[i].wayID];
		marker.type = 'marker';
		way[this.areasWay[i].wayID].marker = marker;
		mapDataLayer.addLayer(marker);
	};
	// Nodes
	var nodes = this.exits.concat(this.tollBooths).concat(this.tollGantrys).concat(this.areasNode).concat(this.unmarked);
	for (var i = 0; i < nodes.length; i++) { node[nodes[i].nodeID].marker=undefined };
	nodes.sort(function (a,b) {return a.lat < b.lat ? +1  : -1 ;});
	for (var i = 0; i < nodes.length; i++) {
		if (node[nodes[i].nodeID].marker!=undefined) { continue; };
		var marker = L.circleMarker({lat:nodes[i].lat, lng:nodes[i].lon}, styleNode(nodes[i]));
		marker.element = node[nodes[i].nodeID];
		marker.type = 'marker';
		node[nodes[i].nodeID].marker = marker;
		mapDataLayer.addLayer(marker);
	};
	mapDataLayer.addTo(map);
	updateVisibility();
	updatePermalink();
}

Freeway.prototype.addToSidebar = function () {
	// Open sidebar if fully loaded
	if (this.loaded==2) {
		$('li#route i').attr('class', 'fa fa-road');
		$('li#stats').toggleClass('disabled', false);
		sidebar.open('route');
	}
	if (this.loaded==4) {
		$('li#stats i').attr('class', 'fa fa-bar-chart');
		console.log('Done');
	};
	// Assign click event to map features
	mapDataLayer.eachLayer( function (layer) {
		layer.on('click', function (e) {
			this.element.sidebar();
		});
	});
	// Route
	$('div.panel.route').remove();
	var country = fw[options.relID].country;
	$('div.sidebar-pane#route').prepend(htmlMotorwayPanel(this, country));
	$('div#route h3').html('Relation : ' + this.relID + htmlButtons('relation',this.relID));
	$('div#route div.tags').html(htmlTagsTable(this));
	// Stats
	$('div#stats h2').html(this.tags.name+' ('+(this.tags.ref||'').replace('-','&#8209;')+')<br/>');
	$('div#stats tr#toll td#data').html();
	$('div#stats tr#exDest td#data').html(this.analysis.exDest);
	$('div#stats tr#exExitTo td#data').html(this.analysis.exExitTo);
	$('div#stats tr#exName td#data').html(this.analysis.exName);
	$('div#stats tr#exNone td#data').html(this.analysis.exTotal-this.analysis.exDir);
	$('div#stats tr#exUnmarked td#data').html(this.analysis.exUnmarked);
	$('div#stats tr#exRef td#data').html(this.analysis.exRef);
	$('div#stats tr#exNoRefYes td#data').html(this.analysis.exNoRefYes);
	$('div#stats tr#exNoRef td#data').html(this.analysis.exNoRef);
	$('div#stats tr#tollBooths td#data').html(this.analysis.tollBooths);
	$('div#stats tr#tollGantrys td#data').html(this.analysis.tollGantrys);
	$('div#stats tr#areas td#data').html(this.analysis.areas);
	$('div#stats tr#wAll td#data').html(Math.round(10000*this.analysis.wAll/this.analysis.wTotal)/100+' %');
	$('div#stats tr#wNoLanes td#data').html(Math.round(10000*this.analysis.wNoLanes/this.analysis.wTotal)/100+' %');
	$('div#stats tr#wNoMaxspeed td#data').html(Math.round(10000*this.analysis.wNoMaxspeed/this.analysis.wTotal)/100+' %');
	$('div#stats tr#wNone td#data').html(Math.round(10000*this.analysis.wNone/this.analysis.wTotal)/100+' %');
	//Timestamp
	$('p#timestamp').html(this.timestamp);
}

Freeway.prototype.zoom = function () {
	if (this.bounds) {
		map.flyToBounds(
			L.latLngBounds(L.latLng(this.bounds.minlat,this.bounds.minlon), 
			L.latLng(this.bounds.maxlat,this.bounds.maxlon)),
			$(window).width() >= 768 ? {paddingTopLeft: [410,0]} : {}
		);
	};
}

Way.prototype.getLength = function () {
	var dist = 0;
	for (var i = 0; i < this.polyline.getLatLngs().length-1; i++) {
		dist += this.polyline.getLatLngs()[i].distanceTo(this.polyline.getLatLngs()[i+1]);
	};
	return dist;
}

Way.prototype.zoom = function () {
	map.flyToBounds(this.polyline.getBounds(),{paddingTopLeft: [410,0], maxZoom: 15});
}


Way.prototype.sidebar = function () {
	options.nodeID=undefined;
	options.wayID=this.wayID;
	$('li#info').toggleClass('disabled', false);
	var country = fw[options.relID].country;
	$('div#info div#tags').html(htmlInfo(this, country));
	sidebar.open('info');
}

Way.prototype.sidebarDestinationLanes = function (lane) {
	var country = fw[options.relID].country;
	$('div#info div#destination-lanes').html(htmlDestinationLanes(this, lane, country));
}

Node.prototype.zoom = function () {
	map.flyTo(this.marker.getLatLng(),15,{paddingTopLeft: [410,0]});
}

Node.prototype.sidebar = function () {
	options.nodeID=this.nodeID;
	options.wayID=undefined;
	$('li#info').toggleClass('disabled', false);
	var country = fw[options.relID].country;
	$('div#info div#tags').html(htmlInfo(this, country));
	sidebar.open('info');
}

function updateVisibility(clicked) {
	if (typeof clicked !== undefined) {
		var id = $(clicked).parent().parent().attr('id');
		if (['exDest','exExitTo','exName','exNone'].indexOf(id)!=-1) {
			$('#exRef .chk').prop('checked', false);
			$('#exNoRefYes .chk').prop('checked', false);
			$('#exNoRef .chk').prop('checked', false);
		};
		if (['exRef','exNoRefYes','exNoRef'].indexOf(id)!=-1) {
			$('#exDest .chk').prop('checked', false);
			$('#exExitTo .chk').prop('checked', false);
			$('#exName .chk').prop('checked', false);
			$('#exNone .chk').prop('checked', false);
		};
	};
	mapChange('exDest','removeLayer');
	mapChange('exExitTo','removeLayer');
	mapChange('exName','removeLayer');
	mapChange('exNone','removeLayer');
	mapChange('exRef','removeLayer');
	mapChange('exNoRefYes','removeLayer');
	mapChange('exNoRef','removeLayer');
	if ($('#tollBooths .chk')[0].checked) { mapChange('tollBooths','addLayer'); } else { mapChange('tollBooths','removeLayer'); };
	if ($('#tollGantrys .chk')[0].checked) { mapChange('tollGantrys','addLayer'); } else { mapChange('tollGantrys','removeLayer'); };
	if ($('#exDest .chk')[0].checked) { mapChange('exDest','addLayer'); };
	if ($('#exExitTo .chk')[0].checked) { mapChange('exExitTo','addLayer'); };
	if ($('#exName .chk')[0].checked) { mapChange('exName','addLayer'); };
	if ($('#exNone .chk')[0].checked) { mapChange('exNone','addLayer'); };
	if ($('#exUnmarked .chk')[0].checked) { mapChange('exUnmarked','addLayer'); } else { mapChange('exUnmarked','removeLayer'); };
	if ($('#exRef .chk')[0].checked) { mapChange('exRef','addLayer'); };
	if ($('#exNoRefYes .chk')[0].checked) { mapChange('exNoRefYes','addLayer'); };
	if ($('#exNoRef .chk')[0].checked) { mapChange('exNoRef','addLayer'); };
	if ($('#areas .chk')[0].checked) { mapChange('areas','addLayer'); } else { mapChange('areas','removeLayer'); };
	if ($('#wAll .chk')[0].checked) { mapChange('wAll','addLayer'); } else { mapChange('wAll','removeLayer'); };
	if ($('#wNoLanes .chk')[0].checked) { mapChange('wNoLanes','addLayer'); } else { mapChange('wNoLanes','removeLayer'); };
	if ($('#wNoMaxspeed .chk')[0].checked) { mapChange('wNoMaxspeed','addLayer'); } else { mapChange('wNoMaxspeed','removeLayer'); };
	if ($('#wNone .chk')[0].checked) { mapChange('wNone','addLayer'); } else { mapChange('wNone','removeLayer'); };
}

function mapChange(group, action) {
	var id = options.relID;
	if (group=='tollBooths') {
		for (var i = 0; i < fw[id].tollBooths.length; i++) {
			map[action](fw[id].tollBooths[i].marker);
		}
    } else if (group=='tollGantrys') {
		for (var i = 0; i < fw[id].tollGantrys.length; i++) {
			map[action](fw[id].tollGantrys[i].marker);
		}
	} else if (group=='exDest') {
		for (var i = 0; i < fw[id].exits.length; i++) {
			if (fw[id].exits[i].hasDestination()) { map[action](fw[id].exits[i].marker); };
		};
	} else if (group=='exExitTo') {
		for (var i = 0; i < fw[id].exits.length; i++) {
			if (!fw[id].exits[i].hasDestination() && 
				fw[id].exits[i].tags.exit_to!==undefined) { map[action](fw[id].exits[i].marker); };
		};
	} else if (group=='exName') {
		for (var i = 0; i < fw[id].exits.length; i++) {
			if (!fw[id].exits[i].hasDestination() && 
				fw[id].exits[i].tags.exit_to==undefined && 
				fw[id].exits[i].tags.name!==undefined) { map[action](fw[id].exits[i].marker); };
		};
	} else if (group=='exNone') {
		for (var i = 0; i < fw[id].exits.length; i++) {
			if (!fw[id].exits[i].hasDestination() && 
				fw[id].exits[i].tags.exit_to==undefined && 
				fw[id].exits[i].tags.name==undefined) { map[action](fw[id].exits[i].marker); };
		};
	} else if (group=='exUnmarked') {
		for (var i = 0; i < fw[id].unmarked.length; i++) {
			map[action](fw[id].unmarked[i].marker);
		};
	} else if (group=='exRef') {
		for (var i = 0; i < fw[id].exits.length; i++) {
			if (fw[id].exits[i].tags.ref!==undefined) { map[action](fw[id].exits[i].marker); };
		};
	} else if (group=='exNoRefYes') {
		for (var i = 0; i < fw[id].exits.length; i++) {
			if (fw[id].exits[i].tags.ref==undefined && 
				fw[id].exits[i].tags.noref=='yes') { map[action](fw[id].exits[i].marker); };
		};
	} else if (group=='exNoRef') {
		for (var i = 0; i < fw[id].exits.length; i++) {
			if (fw[id].exits[i].tags.ref==undefined && 
				fw[id].exits[i].tags.noref==undefined) { map[action](fw[id].exits[i].marker); };
		};
	} else if (group=='areas') {
		for (var i = 0; i < fw[id].areasNode.length; i++) {
			if (fw[id].areasNode[i].tags.highway=='services' || 
				fw[id].areasNode[i].tags.highway=='rest_area') { map[action](fw[id].areasNode[i].marker); };
		};
		for (var i = 0; i < fw[id].areasWay.length; i++) {
			if (fw[id].areasWay[i].tags.highway=='services' || 
				fw[id].areasWay[i].tags.highway=='rest_area') { 
					map[action](fw[id].areasWay[i].marker);
					map[action](fw[id].areasWay[i].polygon); 
			};
		};
	} else if (group=='wAll') {
		for (var i = 0; i < fw[id].waysIDs.length; i++) {
			if (way[fw[id].waysIDs[i]].tags==undefined) { continue; };
			if (way[fw[id].waysIDs[i]].tags.lanes!==undefined && 
				(way[fw[id].waysIDs[i]].tags.maxspeed!==undefined ||
				 way[fw[id].waysIDs[i]].tags['maxspeed:lanes']!==undefined)) { map[action](way[fw[id].waysIDs[i]].polyline); };
		};
	} else if (group=='wNoLanes') {
		for (var i = 0; i < fw[id].waysIDs.length; i++) {
			if (way[fw[id].waysIDs[i]].tags==undefined) { continue; };
			if (way[fw[id].waysIDs[i]].tags.lanes==undefined && 
				(way[fw[id].waysIDs[i]].tags.maxspeed!==undefined ||
				 way[fw[id].waysIDs[i]].tags['maxspeed:lanes']!==undefined)) { map[action](way[fw[id].waysIDs[i]].polyline); };
		};
	} else if (group=='wNoMaxspeed') {
		for (var i = 0; i < fw[id].waysIDs.length; i++) {
			if (way[fw[id].waysIDs[i]].tags==undefined) { continue; };
			if (way[fw[id].waysIDs[i]].tags.lanes!==undefined && 
				way[fw[id].waysIDs[i]].tags.maxspeed==undefined &&
				way[fw[id].waysIDs[i]].tags['maxspeed:lanes']==undefined) { map[action](way[fw[id].waysIDs[i]].polyline); };
		};
	} else if (group=='wNone') {
		for (var i = 0; i < fw[id].waysIDs.length; i++) {
			if (way[fw[id].waysIDs[i]].tags==undefined) { map[action](way[fw[id].waysIDs[i]].polyline); continue; };
			if (way[fw[id].waysIDs[i]].tags.lanes==undefined && 
				way[fw[id].waysIDs[i]].tags.maxspeed==undefined &&
				way[fw[id].waysIDs[i]].tags['maxspeed:lanes']==undefined) { map[action](way[fw[id].waysIDs[i]].polyline); };
		};
	};
}
