var options = {
	radius: 6,
	opacity: 0.8,
	lat: $.url().param('lat'),
	lon: $.url().param('lon'),
	z: $.url().param('z') || $.url().param('zoom'),
	id: ($.url().param('id') ? Number($.url().param('id')) : undefined),
	view: $.url().param('view') || 'tdenxuaALMX',
	tiles: ['tileCA2']
}

loadFromCookies();

colorToll = 'blue';
bgColorToll = '#8888FF';
colorExDest = 'green';
colorExExitTo = 'orange';
colorExName = '#1FFFFF';
colorExNone = '#B60000';
colorExUnmarked = 'black';
bgColorExUnmarked = 'grey';
colorExRef = '#00DB00';
colorExNoRefYes = 'yellow';
colorExNoRef = 'red';
colorAreas = '#F043B4';
bgColorAreas = '#D48FD1';
wColorAll = 'blue';
wColorNoLanes = 'orange';
wColorNoMaxspeed = 'yellow';
wColorNone = 'red';
wColorConstruction = 'black';
wColorProposed = 'grey';

$('document').ready(function () {
	$('table.stats tr#tolls td div#circle').css('border-color', colorToll);
	$('table.stats tr#tolls td div#circle').css('background', bgColorToll);
	$('table.stats tr#exDest td div#circle').css('border-color', colorExDest);
	$('table.stats tr#exExitTo td div#circle').css('border-color', colorExExitTo);
	$('table.stats tr#exName td div#circle').css('border-color', colorExName);
	$('table.stats tr#exNone td div#circle').css('border-color', colorExNone);
	$('table.stats tr#exUnmarked td div#circle').css('border-color', colorExUnmarked);
	$('table.stats tr#exUnmarked td div#circle').css('background', bgColorExUnmarked);
	$('table.stats tr#exRef td div#circle').css('background', colorExRef);
	$('table.stats tr#exRef td div#circle').css('border-color', 'white');
	$('table.stats tr#exNoRefYes td div#circle').css('background', colorExNoRefYes);
	$('table.stats tr#exNoRefYes td div#circle').css('border-color', 'white');
	$('table.stats tr#exNoRef td div#circle').css('background', colorExNoRef);
	$('table.stats tr#exNoRef td div#circle').css('border-color', 'white');
	$('table.stats tr#areas td div#circle').css('border-color', colorAreas);
	$('table.stats tr#areas td div#circle').css('background', bgColorAreas);

	$('table.stats tr#wAll td div#line').css('background', wColorAll);
	$('table.stats tr#wNoLanes td div#line').css('background', wColorNoLanes);
	$('table.stats tr#wNoMaxspeed td div#line').css('background', wColorNoMaxspeed);
	$('table.stats tr#wNone td div#line').css('background', wColorNone);

	$('#sliderOpacity').slider({
		min: 2,
		max: 10,
		value: options.opacity*10,
		change: function (event, ui) {
			options.opacity = $(this).slider('value')/10;
			mapDataLayer.eachLayer( function (layer) { 
				if (layer.type=='marker') { 
					layer.setStyle({opacity:options.opacity, fillOpacity:options.opacity}); 
				}; 
			});
			updateCookies();
		}
	});

	$('#sliderRadius').slider({
		min: 5,
		max: 20,
		value: options.radius,
		change: function (event, ui) {
			options.radius = $(this).slider('value');
			mapDataLayer.eachLayer( function (layer) { 
				if (layer.type=='marker') { 
					layer.setRadius(options.radius).setStyle({weight:options.radius/2}); 
				}; 
			});
			updateCookies();
		}
	});

	if (options.tiles.indexOf('tileOSM')!==-1) { 
		$('#tileOSM .chk').prop('checked', true); 
	} else { 
		$('#tileOSM .chk').prop('checked', false); 
	};
	if (options.tiles.indexOf('tileCA2')!==-1) { 
		$('#tileCA2 .chk').prop('checked', true); 
	} else { 
		$('#tileCA2 .chk').prop('checked', false); 
	};
	if (options.tiles.indexOf('tileMapillary')!==-1) { 
		$('#tileMapillary .chk').prop('checked', true); 
	} else { 
		$('#tileMapillary .chk').prop('checked', false); 
	};
	if (options.tiles.indexOf('tile30USCities')!==-1) { 
		$('#tile30USCities .chk').prop('checked', true); 
	} else { 
		$('#tile30USCities .chk').prop('checked', false); 
	};

	$('.stats .chk').change(function() {
		updateVisibility(this);
		updatePermalink();
	});

	$('.tile .chk').change(function() {
		updateTiles(this);
	});
})

function styleNode(node) {
	// Returns a style object based on node tags

	if (node.tags==undefined) { var color = {color: colorExUnmarked}; var fill = {fillColor: bgColorExUnmarked};
	} else if (node.tags.highway=='motorway_junction') {
		//Outer style
		if (node.hasDestination()) { var color = {color: colorExDest};
		} else if (node.exit_to!=undefined) { var color = {color: colorExExitTo};
		} else if (node.name!=undefined) { var color = {color: colorExName};
		} else { var color = {color: colorExNone}; };
		//Inner style
		if (node.ref!=undefined) { var fill = {fillColor: colorExRef};
		} else if (node.tags.noref=='yes') { var fill = {fillColor: colorExNoRefYes};
		} else { var fill = {fillColor: colorExNoRef}; };
	} else if (node.tags.highway=='services'||node.tags.highway=='rest_area') {
		var color = {color: colorAreas};
		var fill = {fillColor: bgColorAreas};
	} else if (node.tags.barrier=='toll_booth') {
		var color = {color: colorToll};
		var fill = {fillColor: bgColorToll};
	} else {
		var color = {color: colorExUnmarked};
		var fill = {fillColor: bgColorExUnmarked};
	}
	return $.extend(color, fill, {weight:options.radius/2, radius:options.radius, opacity:options.opacity, fillOpacity: options.opacity});
}

function styleWay(tags) {
	// Returns a style object based on way tags

	if (tags==undefined) { var style = {color: wColorNone};
	} else if (tags.highway=='construction') { var style = {color: wColorConstruction};
	} else if (tags.highway=='proposed') { var style = {color: wColorProposed};
	} else if (tags.highway=='services' || tags.highway=='rest_area') { var style = {color: colorAreas, fillColor: bgColorAreas};
	} else if (!tags.maxspeed && !tags.lanes) { var style = {color: wColorNone};
	} else if (!tags.maxspeed) { var style = {color: wColorNoMaxspeed};
	} else if (!tags.lanes) { var style = {color: wColorNoLanes};
	} else { var style = {color: wColorAll};
	};
	return $.extend(style,{smoothFactor:2, opacity:0.7, weight: 6});
}

function htmlInfo(element) {
	// Returns html code showing info of a way or node 
	// including a junction panel if it is an exit node

	var html = '';
	if (element.subtype=='exit') {
		for (var i in element.linkWays) {
			html += htmlJunctionPanel(element, element.linkWays[i]);
		};
	};
	if (element.type=='node' || element.type=='way') {
		html += htmlGenericInfo(element);
	};
	if (element.subtype=='exit') {
		for (var i in element.linkWays) {
			html += htmlGenericInfo(element.linkWays[i]);
		};
	};
	html += '<p id="timestamp">' + fw[options.relID].timestamp + '</p>';
	return html;
}

function htmlJunctionPanel (nodeElement, wayElement) {
	// Returns html code of a junction panel like the ones in the real world

	// Get ref
	var ref = wayElement.tags['junction:ref'] || nodeElement.tags.ref || '&nbsp;';
	// Get destination or equivalent
	if (wayElement && wayElement.hasDestination()) {
		var dest = wayElement.getDestination();
	} else {
		var dest = nodeElement.tags.exit_to || nodeElement.tags.name || '&nbsp;';
	};
	dest = dest.replace(/;/g, '</br>');
	// Get destination:ref
	var dest_ref = '';
	if (wayElement && wayElement.tags['destination:ref']!=undefined) {
		var destRefArray = wayElement.tags['destination:ref'].split(/;/g);
		for (var i = 0; i < destRefArray.length; i++) {
			dest_ref += '<div class="refText">'+
				destRefArray[i].replace(/ /g, '&nbsp;').replace(/-/g, '&#8209;')+'</div> ';
		};
	};
	// Get destination:int_ref
	var dest_int_ref = '';
	if (wayElement && wayElement.tags['destination:int_ref']!=undefined) {
		var destIntRefArray = wayElement.tags['destination:int_ref'].split(/;/g);
		for (var i = 0; i < destIntRefArray.length; i++) {
			dest_int_ref += '<div class="intRefText">'+
			destIntRefArray[i].replace(/ /g, '&nbsp;').replace(/-/g, '&#8209;')+'</div> ';
		};
	};
	// Get destination:symbol
	var dest_symbol = '';
	if (wayElement && wayElement.tags['destination:symbol']!=undefined) {
		var destSymbolArray = wayElement.tags['destination:symbol'].split(/;/g);
		for (var i = 0; i < destSymbolArray.length; i++) {
			dest_symbol += '<div class="symbol">'+htmlSymbol(destSymbolArray[i])+'</div> ';
		};
	};
	// Get country
	var country = fw[options.relID].country;

	// Prepare html panel
	if (country == 'US') {
		var color = 'usStyle';
		var exitSymbol = '<div class="exitSymbol usExitSymbol">EXIT</div>';
	} else {
		var color = 'euStyle';
		var exitSymbol = '<div class="exitSymbol euExitSymbol"><img src="img/exit.svg" height="20px"/></div>';
	};
	var html = 	'<div class="panelWrapper">'+
					'<div class="symbolsHolder">'+(country=='US'?dest_symbol:'')+'</div>'+
					'<div class="panel '+color+'">' +
						'<div class="subPanel refPanel">'+exitSymbol+ref.replace("<","&lt;")+'</div>' +
						'<div class="subPanel destinationPanel">'+
							'<table><tr>'+
								'<td class="destinationCell">'+dest+'</td>'+
								'<td class="refCell">'+dest_int_ref+dest_ref+'</td>'+
							'</tr></table>'+
							'<div class="symbolsHolder">'+(country!=='US'?dest_symbol:'')+'</div>'+
						'</div>'+
					'</div>'+
				'</div>';
	return html;
}

function htmlSymbol (symbol) {
	// Returns html code of a given destination:symbol

	symbolsList = {
		'aerialway': {
			'eu': 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Pictogram_Cable_Car.svg',
			'us': 'https://upload.wikimedia.org/wikipedia/commons/6/60/MUTCD_RS-071.svg',
		},
		'airport': {
			'us': 'https://upload.wikimedia.org/wikipedia/commons/b/bf/MUTCD_I-5.svg',
		},
		'camp_site': {
			'us': 'https://upload.wikimedia.org/wikipedia/commons/4/45/MUTCD_D9-3.svg',
		},
		'centre': {
			'eu': 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Italian_traffic_signs_-_icona_centro.svg',
		},
		'ferry': {
			'eu': 'https://upload.wikimedia.org/wikipedia/commons/9/92/Ferry.png',
			'us': 'https://upload.wikimedia.org/wikipedia/commons/7/72/MUTCD_I-9.svg',
		},
		'food': {
			'us': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/MUTCD_D9-8.svg',
		},
		'fuel': {
			'us': 'https://upload.wikimedia.org/wikipedia/commons/0/03/MUTCD_D9-7.svg',
		},
		'fuel_cng': {
			'us': 'https://upload.wikimedia.org/wikipedia/commons/6/65/MUTCD_D9-11a.svg',
		},
		'fuel_diesel': {
			'us': 'https://upload.wikimedia.org/wikipedia/commons/7/7e/MUTCD_D9-11.svg',
		},
		'fuel_e85': {
			'us': 'https://upload.wikimedia.org/wikipedia/commons/f/f3/MUTCD_D9-11c.svg',
		},
		'fuel_ev': {
			'us': 'https://upload.wikimedia.org/wikipedia/commons/6/6c/MUTCD_D9-11b.svg',
		},
		'hospital': {
			'us': 'https://upload.wikimedia.org/wikipedia/commons/f/fd/MUTCD_D9-2.svg',
		},
		'industrial': {
			'eu': 'https://upload.wikimedia.org/wikipedia/commons/4/4e/RWB_Industriegebiet.svg',
		},
		'info': {
			'us': 'https://upload.wikimedia.org/wikipedia/commons/a/a4/MUTCD_D9-10.svg',
		},
		'lodging': {
			'us': 'https://upload.wikimedia.org/wikipedia/commons/4/44/MUTCD_D9-9.svg',
		},
		'parking': {
			'us': 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Japanese_Road_sign_(Parking_lot_A,_Parking_permitted).svg',
		},
		'parking_truck': {
			'us': 'https://upload.wikimedia.org/wikipedia/commons/0/00/MUTCD_D9-16.svg',
		},
		'phone': {
			'us': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/MUTCD_D9-1.svg',
		},
		'train_station': {
			'eu': 'https://upload.wikimedia.org/wikipedia/commons/3/33/Fernbahn_Signet_HVV.svg',
			'us': 'https://upload.wikimedia.org/wikipedia/commons/a/a5/MUTCD_I-7.svg',
		},
		'TDD': {
			'us': 'https://upload.wikimedia.org/wikipedia/commons/8/8a/MUTCD_D9-21.svg',
		},
		'wifi': {
			'us': 'https://upload.wikimedia.org/wikipedia/commons/0/05/MUTCD_D9-22.svg',
		},
	};

	if (fw[options.relID].country == 'US') {
		var country = 'us';
	} else {
		var country = 'eu';
	};

	symbol = symbol.replace(/\s+/g, '');
	if (symbolsList[symbol]) {
		var img = symbolsList[symbol][country] || symbolsList[symbol]['us'] || symbolsList[symbol]['eu'];
	};

	if (img) {
		return '<img src='+img+'></img>';
	} else {
		return '<div class="unknownSymbol '+country+'Style">?</div>';
	}
}

function htmlMotorwayPanel (element) {
	// Returns html code of a panel with the ref and name of the motorway

	if (fw[options.relID].country == 'US') {
		var color = 'usStyle';
	} else {
		var color = 'euStyle';
	};
	var html =	'<div class="panelWrapper">'+
					'<div class="panel '+color+' road">'+
						'<div class="subPanel road">';
	if (element.tags.symbol) {
		html += '<div class="symbol"><img src="'+element.tags.symbol+'"/></div>';
	} else {
		html += '<div class="ref'+(element.tags.network=='e-road'?' greenE':'')+'">' + (element.ref || '') +'</div>';
	}
	html += 				'<div class="name">'+element.name+'</div>'+
						'</div>'+
					'</div>'+
				'</div>';
	return html;
}

function htmlGenericInfo (element) {
	// Returns html code showing generic info of a way or node

	var html = '';
	if (element.type == 'node') {
		html += '<h3>Node : ' + element.nodeID + htmlButtons('node',element.nodeID) + '</h3>';
	} else if (element.type == 'way') {
		html += '<h3>Way : ' + element.wayID + htmlButtons('way',element.wayID) + '</h3>';
	};
	html += htmlTagsTable(element);
	return html;
}

function htmlButtons (type, id) {
	// Returns html code of buttons linking to other OSM tools

	html = '';
	if (type=='relation') {
		html += ' <button class="icon" onClick="fw['+id+'].zoom()" title="Zoom to motorway"><i class="fa fa-eye icon"></i></button>'+
			' <a href="https://www.openstreetmap.org/relation/'+id+'" target="_blank" title="OpenStreetMap">';
	};
	html += ' <a href="https://www.openstreetmap.org/'+type+'/'+id+'" target="_blank" title ="OpenStreetMap">'+
		'<button class="icon"><img class="icon" src="img/osm-logo.png"/></button></a>'+
		' <a href="http://127.0.0.1:8111/load_object?new_layer=false&objects='+type+id+'" target="hiddenIframe" title="JOSM editor">'+
		'<button class="icon"><img class="icon" src="img/josm-logo.png"/></button></a>'+
		' <a href="https://www.openstreetmap.org/edit?editor=id&'+type+'='+id+'" target="_blank" title="ID editor">'+
		'<button class="icon"><img class="icon" src="img/id-logo.png"/></button></a>'+
		' <a href="http://level0.osmz.ru/?url='+type+'/'+id+'" target="_blank" title="Level0 editor">'+
		'<button class="icon">L0</button></a>';
	if (type=='relation') {
		html += ' <a href="http://ra.osmsurround.org/analyzeRelation?relationId='+id+'" target="_blank" title="Relation Analyzer">'+
			'<button class="icon">An</button></a>'+
			' <a href="http://osmrm.openstreetmap.de/relation.jsp?id='+id+'" target="_blank" title="Relation Manager">'+
			'<button class="icon">Ma</button></a>';
	};
	return html;
}

function htmlTagsTable (element) {
	// Returns html code of a table showing tags of a way or node

	var html = '<table class="tags">';
	for (key in element.tags) {
		html += '<tr><td class="code key">'+key+'</td>'+
		'<td class="code">'+element.tags[key].replace('<','&lt;').replace(/;/g,';&#8203;') +'</td></tr>';
	};
	if (element.tags==undefined) { html += '<p>No tags</p>'};
	html += '</table>';
	return html;
}

function updateCookies () {
	// Saves options object to cookies

	Cookies.set('opacity',options.opacity);
	Cookies.set('radius',options.radius);
	Cookies.set('tiles',options.tiles.toString());
}

function loadFromCookies () {
	// Loads cookies info into options object

	if (Cookies.get('radius')!==undefined) {
		options.radius = Number(Cookies.get('radius')); 
	};
	if (Cookies.get('opacity')!==undefined) {
		options.opacity = Number(Cookies.get('opacity'));
	};
	if (Cookies.get('tiles')!==undefined) {
		options.tiles = Cookies.get('tiles').split(',');
	};
}
