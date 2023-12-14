var options = {
	radius: 6,
	opacity: 0.8,
	lat: $.url().param('lat'),
	lon: $.url().param('lon'),
	z: $.url().param('z') || $.url().param('zoom'),
	id: ($.url().param('id') ? Number($.url().param('id')) : undefined),
	view: $.url().param('view') || 'tgdenxuaALMX',
	tiles: ['tileCA2']
}

loadFromCookies();

colorTollBooth = 'blue';
bgColorTollBooth = '#8888FF';
colorTollGantry = 'dodgerblue';
bgColorTollGantry = '#8EC9FF';
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
	$('table.stats tr#tollBooths td div#circle').css('border-color', colorTollBooth);
	$('table.stats tr#tollBooths td div#circle').css('background', bgColorTollBooth);
	$('table.stats tr#tollGantrys td div#circle').css('border-color', colorTollGantry);
	$('table.stats tr#tollGantrys td div#circle').css('background', bgColorTollGantry);
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
		} else if (node.tags.exit_to!=undefined) { var color = {color: colorExExitTo};
		} else if (node.tags.name!=undefined) { var color = {color: colorExName};
		} else { var color = {color: colorExNone}; };
		//Inner style
		if (node.tags.ref!=undefined) { var fill = {fillColor: colorExRef};
		} else if (node.tags.noref=='yes') { var fill = {fillColor: colorExNoRefYes};
		} else { var fill = {fillColor: colorExNoRef}; };
	} else if (node.tags.highway=='services'||node.tags.highway=='rest_area') {
		var color = {color: colorAreas};
		var fill = {fillColor: bgColorAreas};
	} else if (node.tags.barrier=='toll_booth') {
		var color = {color: colorTollBooth};
		var fill = {fillColor: bgColorTollBooth};
	} else if (node.tags.highway=='toll_gantry') {
		var color = {color: colorTollGantry};
		var fill = {fillColor: bgColorTollGantry};
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
	} else if (!tags.maxspeed && !tags['maxspeed:lanes'] && !tags.lanes) { var style = {color: wColorNone};
	} else if (!tags.maxspeed && !tags['maxspeed:lanes']) { var style = {color: wColorNoMaxspeed};
	} else if (!tags.lanes) { var style = {color: wColorNoLanes};
	} else { var style = {color: wColorAll};
	};
	return $.extend(style,{smoothFactor:2, opacity:0.7, weight: 6});
}

function htmlInfo(element, country) {
	// Returns html code showing info of a way or node 
	// including a junction panel if it is an exit node

	var html = '';
	if (element.subtype=='exit') {
		for (var i in element.linkWays) {
			html += htmlJunctionPanel(element, element.linkWays[i], country);
			html += htmlSpeeds(element.linkWays[i], country);
		};
	};
	if (element.type=='way') {
		html += htmlDestinationLanes(element, null, country);
		html += htmlLanes(element, country);
		html += htmlSpeeds(element, country);
	};
	if (element.type=='node' || element.type=='way') {
		html += htmlGenericInfo(element);
	};
	if (element.subtype=='exit') {
		for (var i in element.linkWays) {
			html += htmlGenericInfo(element.linkWays[i]);
		};
	};
	if (element.type=='way' || element.subtype=='exit') {
		html += htmlPrevNext(element);
	};
	html += '<div id="timestamp"><p>' + fw[options.relID].timestamp + 
		'</p></div>';
	return html;
}

function htmlJunctionPanel (nodeElement, wayElement, country) {
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
			dest_symbol += htmlSymbol(destSymbolArray[i], country);
		};
	};

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

function htmlSymbol (symbol, country) {
	// Returns html code of a given destination:symbol

	symbolsList = {
		'aerialway': {
			'eu': 'https://upload.wikimedia.org/wikipedia/commons/3/34/Italian_traffic_signs_-_icona_funivia.svg',
			'us': 'https://upload.wikimedia.org/wikipedia/commons/6/60/MUTCD_RS-071.svg',
		},
		'airport': {
			'eu': 'https://upload.wikimedia.org/wikipedia/commons/a/af/Italian_traffic_signs_-_simbolo_aeroporto_%28figura_II_116%29.svg',
			'us': 'https://upload.wikimedia.org/wikipedia/commons/b/bf/MUTCD_I-5.svg',
		},
		'camp_site': {
			'eu': 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Italian_traffic_signs_-_icona_campeggio.svg',
			'us': 'https://upload.wikimedia.org/wikipedia/commons/4/45/MUTCD_D9-3.svg',
		},
		'centre': {
			'eu': 'https://upload.wikimedia.org/wikipedia/commons/3/34/Italian_traffic_signs_-_simbolo_centro_%28figura_II_100%29.svg',
		},
		'ferry': {
			'eu': 'https://upload.wikimedia.org/wikipedia/commons/9/92/Ferry.png',
			'us': 'https://upload.wikimedia.org/wikipedia/commons/7/72/MUTCD_I-9.svg',
		},
		'food': {
			'eu': 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Italian_traffic_signs_-_icona_ristorante.svg',
			'us': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/MUTCD_D9-8.svg',
		},
		'fuel': {
			'eu': 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Italian_traffic_signs_-_icona_rifornimento.svg',
			'us': 'https://upload.wikimedia.org/wikipedia/commons/0/03/MUTCD_D9-7.svg',
		},
		'fuel_cng': {
			'us': 'https://upload.wikimedia.org/wikipedia/commons/6/65/MUTCD_D9-11a.svg',
		},
		'fuel_diesel': {
			'eu': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Italian_traffic_signs_-_icona_diesel.svg',
			'us': 'https://upload.wikimedia.org/wikipedia/commons/7/7e/MUTCD_D9-11.svg',
		},
		'fuel_e85': {
			'us': 'https://upload.wikimedia.org/wikipedia/commons/f/f3/MUTCD_D9-11c.svg',
		},
		'fuel_ev': {
			'us': 'https://upload.wikimedia.org/wikipedia/commons/6/6c/MUTCD_D9-11b.svg',
		},
		'hospital': {
			'eu': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Italian_traffic_signs_-_simbolo_ospedale_%28figura_II_104%29.svg',
			'us': 'https://upload.wikimedia.org/wikipedia/commons/f/fd/MUTCD_D9-2.svg',
		},
		'industrial': {
			'eu': 'https://upload.wikimedia.org/wikipedia/commons/0/0f/RWB-RWBA-Symbol_Industriegebiet%2C_Gewerbegebiet.svg',
		},
		'info': {
			'eu': 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Italian_traffic_signs_-_icona_informazioni_%28figura_II_108%29.svg',
			'us': 'https://upload.wikimedia.org/wikipedia/commons/a/a4/MUTCD_D9-10.svg',
		},
		'lodging': {
			'eu': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Italian_traffic_signs_-_icona_albergo_o_motel.svg',
			'us': 'https://upload.wikimedia.org/wikipedia/commons/4/44/MUTCD_D9-9.svg',
		},
		'parking': {
			'eu': 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Italian_traffic_signs_-_icona_parcheggio.svg',
			'us': 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Japanese_Road_sign_(Parking_lot_A,_Parking_permitted).svg',
		},
		'parking_truck': {
			'us': 'https://upload.wikimedia.org/wikipedia/commons/0/00/MUTCD_D9-16.svg',
		},
		'phone': {
			'eu': 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Italian_traffic_signs_-_icona_telefono.svg',
			'us': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/MUTCD_D9-1.svg',
		},
		'soccer_stadium': {
			'eu': 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Italian_traffic_signs_-_icona_stadio.svg',
		},
		'toilets': {
			'eu': 'https://upload.wikimedia.org/wikipedia/commons/0/06/Italian_traffic_signs_-_icona_wc.svg',
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

	if (!symbol || symbol == 'none') {
		return '';
	}

	if (country == 'US') {
		country = 'us';
	} else {
		country = 'eu';
	}

	symbol = symbol.replace(/\s+/g, '');
	if (symbolsList[symbol]) {
		var img = symbolsList[symbol][country] || symbolsList[symbol]['us'] || symbolsList[symbol]['eu'];
	};

	if (img) {
		return '<div class="symbol"><img src=' + img + '></img></div> ';
	} else {
		return '<div class="symbol"><div class="unknownSymbol ' + country + 'Style">¿?</div></div> ';
	}
}

function htmlMotorwayPanel (element, country) {
	// Returns html code of a panel with the ref and name of the motorway

	if (country == 'US') {
		var color = 'usStyle';
	} else {
		var color = 'euStyle';
	};
	var html =	'<div class="panelWrapper">'+
					'<div class="panel '+color+' route">'+
						'<div class="subPanel route">';
	if (element.tags.symbol) {
		html += '<div class="symbol"><img src="'+element.tags.symbol+'"/></div>';
	} else {
		html += '<div class="ref'+(element.tags.network=='e-road'?' greenE':'')+'">' + (element.tags.ref || '') +'</div>';
	}
	html += 				'<div class="name">'+element.tags.name+'</div>'+
						'</div>'+
					'</div>'+
				'</div>';
	return html;
}

function htmlSpeeds (wayElement, country) {
	// Returns html code of all speed signs

	var html = 	'<div class="panelWrapper">' +
					htmlMaxspeed(wayElement, country) +
			   		htmlAdvisoryMaxspeed(wayElement, country) + 
			   		htmlMinspeed(wayElement, country) +
		   		'</div>';

	return html;
}

function htmlMaxspeed (wayElement, country) {
	// Returns html code of a maxspeed sign, given a wayElement

	// Get maxspeed
	if (wayElement && wayElement.tags['maxspeed']) {
		var maxspeed = wayElement.tags['maxspeed'];
	}

	return htmlMaxspeedValue(maxspeed, country);
}

function htmlMaxspeedValue (speed, country) {
	// Returns html code of a maxspeed sign, given a maxspeed value

	if (!speed || speed == 'none') {
		return '';
	}

	// Remove mph
	speed = speed.replace(' mph','');

	// Prepare html sign
	if (country == 'US') {
		var html = 	'<div class="panel maxspeed usStyle">' +
						'<div class="subPanel speed">'+
							'<p class="title">SPEED LIMIT</p>'+
							'<p class="speed">'+speed+'</p>'+
							'<p class="mph">MPH</p>'+
						'</div>'+
					'</div>';
	} else {
		var html = 	'<div class="panel maxspeed euStyle">' +
						'<div class="subPanel speed">'+
							'<p class="speed">'+speed+'</p>'+
						'</div>'+
					'</div>';
	}

	return html;
}

function htmlMinspeed (wayElement, country) {
	// Returns html code of a minspeed sign, given a wayElement

	// Get maxspeed
	if (wayElement && wayElement.tags['minspeed']) {
		var minspeed = wayElement.tags['minspeed'];
	}

	return htmlMinspeedValue(minspeed, country);
}

function htmlMinspeedValue (speed, country) {
	// Returns html code of a minspeed sign, given a minspeed value

	if (!speed || speed == 'none') {
		return '';
	}

	// Remove mph
	speed = speed.replace(' mph','');

	// Prepare html sign
	if (country == 'US') {
		var html = 	'<div class="panel minspeed usStyle">' +
						'<div class="subPanel speed">'+
							'<p class="title">MIN SPEED</p>'+
							'<p class="speed">'+speed+'</p>'+
							'<p class="mph">MPH</p>'+
						'</div>'+
					'</div>';
	} else {
		var html = 	'<div class="panel minspeed euStyle">' +
						'<div class="subPanel speed">'+
							'<p class="speed">'+speed+'</p>'+
						'</div>'+
					'</div>';
	}

	return html;
}

function htmlAdvisoryMaxspeed (wayElement, country) {
	// Returns html code of an advisory maxspeed , given a wayElement

	// Get maxspeed:advisory
	if (wayElement && wayElement.tags['maxspeed:advisory']) {
		var advisoryMaxspeed = wayElement.tags['maxspeed:advisory'].replace(' mph','');;
	}

	return htmlAdvisoryMaxspeedValue (advisoryMaxspeed, country);
}

function htmlAdvisoryMaxspeedValue (speed, country) {
	// Returns html code of an advisory maxspeed sign, give an advisory maxspeed value

	if (!speed || speed == 'none') {
		return '';
	}

	// Remove mph
	speed = speed.replace(' mph','');

	// Prepare html sign
	if (country == 'US') {
		var html = 	'<div class="panel advisoryMaxspeed usStyle">' +
						'<div class="subPanel speed">'+
							'<p class="speed">'+speed+'</p>'+
							'<p class="mph">MPH</p>'+
						'</div>'+
					'</div>';
	} else {
		var html = 	'<div class="panel advisoryMaxspeed euStyle">' +
						'<div class="subPanel speed">'+
							'<p class="speed">'+speed+'</p>'+
						'</div>'+
					'</div>';
	};

	return html;
}

function htmlLanes (wayElement, country) {
	// Returns html code of road with lanes

	// Get lanes
	if (wayElement && wayElement.tags['lanes']) {
		var lanes = wayElement.tags['lanes'];
	};

	if (!lanes) {
		return '';
	};

	// Get lanes maxspeed
	if (wayElement && wayElement.tags['maxspeed:lanes']) {
		var maxspeedLanes = wayElement.tags['maxspeed:lanes'];
		maxspeedLanes = maxspeedLanes.split(/\|/g);
	}

	// Get lanes minspeed
	if (wayElement && wayElement.tags['minspeed:lanes']) {
		var minspeedLanes = wayElement.tags['minspeed:lanes'];
		minspeedLanes = minspeedLanes.split(/\|/g);
	}

	// Get turn lanes
	if (wayElement && wayElement.tags["turn:lanes"]) {
		var turnLanes = wayElement.tags["turn:lanes"];
		turnLanes = turnLanes.split(/\|/g);
	}

	var html = 	'<div class="road">';

	for (var i = 0; i < lanes; i++) {

		html +=	'<div class="lane">';

		// Calculate sizes
		if (lanes > 5) {
			var size = 'supersmall';
		} else {
			var size = 'small';
		}

		// Maxspeed
		if (maxspeedLanes && maxspeedLanes[i] && maxspeedLanes[i] != 'none') {
			html += '<div class="speedsign ' + size + '">' + 
						htmlMaxspeedValue(maxspeedLanes[i], country) +
					'</div>';
		}

		// Minspeed
		if (minspeedLanes && minspeedLanes[i] && minspeedLanes[i] != 'none') {
			html += '<div class="speedsign ' + size + '">' +
						htmlMinspeedValue(minspeedLanes[i], country) +
					'</div>';
		}

		// Turn lanes
		if (turnLanes && turnLanes[i] && turnLanes[i] != 'none') {

			var turnLane = turnLanes[i];
			turnLane = turnLane.split(/;/g);

			html += '<div class="spacer"></div>';

			html +=	'<div class="arrow ' + size + '">' +
						'<div class="arrow-line-base"></div>';

			if (turnLane && turnLane.indexOf('through') != -1) {
				html += '<div class="arrow-through">' +
							'<div class="arrow-head"></div>' +
							'<div class="arrow-line"></div>' +
						'</div>';
			}

			if (turnLane && (turnLane.indexOf('slight_left') != -1 ||
							 turnLane.indexOf('merge_to_left') != -1)) {
				html += '<div class="arrow-slight-left">' +
							'<div class="arrow-head"></div>' +
							'<div class="arrow-line"></div>' +
						'</div>';
			}

			if (turnLane && (turnLane.indexOf('slight_right') != -1 ||
							 turnLane.indexOf('merge_to_right') != -1)) {
				html += '<div class="arrow-slight-right">' +
							'<div class="arrow-head"></div>' +
							'<div class="arrow-line"></div>' +
						'</div>';
			}

			if ((	(turnLane && turnLane.indexOf('left') != -1) ||
				 	(turnLane && turnLane.indexOf('right') != -1)) &&
				(	(turnLane && turnLane.indexOf('slight_left') != -1) ||
					(turnLane && turnLane.indexOf('merge_to_left') != -1) ||
					(turnLane && turnLane.indexOf('slight_right') != -1) ||
					(turnLane && turnLane.indexOf('merge_to_right') != -1))) {
					var offset = 'offset';
				} else {
					var offset = '';
				}

			if (turnLane && turnLane.indexOf('left') != -1) {
				html += '<div class="arrow-left ' + offset + '">' + 
							'<div class="arrow-head"></div>' +
							'<div class="arrow-line"></div>' +
						'</div>';
			}

			if (turnLane && turnLane.indexOf('right') != -1) {
				html += '<div class="arrow-right ' + offset + '">' + 
							'<div class="arrow-head"></div>' +
							'<div class="arrow-line"></div>' + 
						'</div>';
			}

			html += '</div>';
		}

		html += '</div>';
	}

	html += '</div>';

	return html;
};

function htmlDestinationLanes (wayElement, selectedLane, country) {
	// Returns html code of destination panel of lanes

	// Get lanes
	if (wayElement && wayElement.tags['lanes']) {
		var lanes = wayElement.tags['lanes'];
	};

	if (!lanes) {
		return '';
	};

	// Get destination of lanes
	if (wayElement && wayElement.tags["destination:lanes"]) {
		var destinationLanes = wayElement.tags["destination:lanes"];
		destinationLanes = destinationLanes.split(/\|/);
	} else {
		destinationLanes = [];
	}

	// Get destination:street of lanes
	if (wayElement && wayElement.tags["destination:street:lanes"]) {
		var destinationStreetLanes = wayElement.tags["destination:street:lanes"];
		destinationStreetLanes = destinationStreetLanes.split(/\|/);
	} else {
		destinationStreetLanes = [];
	}

	// Get destination:ref of lanes
	if (wayElement && wayElement.tags["destination:ref:lanes"]) {
		var destinationRefLanes = wayElement.tags["destination:ref:lanes"];
		destinationRefLanes = destinationRefLanes.split(/\|/);
	} else {
		destinationRefLanes = [];
	}

	// Get destination:int_ref of lanes
	if (wayElement && wayElement.tags["destination:int_ref:lanes"]) {
		var destinationIntRefLanes = wayElement.tags["destination:int_ref:lanes"];
		destinationIntRefLanes = destinationIntRefLanes.split(/\|/);
	} else {
		destinationIntRefLanes = [];
	}

	// Get destination:symbol of lanes
	if (wayElement && wayElement.tags["destination:symbol:lanes"]) {
		var destinationSymbolLanes = wayElement.tags["destination:symbol:lanes"];
		destinationSymbolLanes = destinationSymbolLanes.split(/\|/);
	} else {
		destinationSymbolLanes = [];
	}

	if (!destinationLanes.length && 
		!destinationStreetLanes.length && 
		!destinationRefLanes.length &&
		!destinationIntRefLanes.length &&
		!destinationSymbolLanes.length) {
		return '';
	}

	if (country == 'US') {
		var countryStyle = 'usStyle';
	} else {
		var countryStyle = 'euStyle';
	}

	html = '<div id="destination-lanes">' + 
				'<div class="panel lanes ' + countryStyle + '">';

	if (selectedLane != null) {

		// Get destination of selected lane
		if (destinationLanes && destinationLanes[selectedLane]) {
			var destination = destinationLanes[selectedLane].split(/;/);
		} else {
			var destination = [];
		}

		// Get destination:street of selected lane
		if (destinationStreetLanes && destinationStreetLanes[selectedLane]) {
			var destinationStreet = destinationStreetLanes[selectedLane].split(/;/);
		} else {
			var destinationStreet = [];
		}

		// Get destination:ref of selected lane
		if (destinationRefLanes && destinationRefLanes[selectedLane]) {
			var destinationRef = destinationRefLanes[selectedLane].split(/;/);
		} else {
			var destinationRef = [];
		}

		// Get destination:int_ref of selected lane
		if (destinationIntRefLanes && destinationIntRefLanes[selectedLane]) {
			var destinationIntRef = destinationIntRefLanes[selectedLane].split(/;/);
		} else {
			var destinationIntRef = [];
		}

		// Get destination:symbol of selected lane
		if (destinationSymbolLanes && destinationSymbolLanes[selectedLane]) {
			var destinationSymbol = destinationSymbolLanes[selectedLane].split(/;/);
		} else {
			var destinationSymbol = [];
		}

		html += 	'<div class="subPanel destinationPanel">' +
						'<table><tr>'+
							'<td class="destinationCell">';

		// Add destination
		for (var i = 0; i < destination.length; i++) {
			html += 			destination[i] + '</br>';
		}

		// Add destination:street
		for (var i = 0; i < destinationStreet.length; i++) {
			html += 			destinationStreet[i] + '</br>';
		}

		html += 			'</td>' +
							'<td class="refCell">';

		// Add destination:ref
		for (var i = 0; i < destinationRef.length; i++) {
			html += 			'<div class="refText">' + destinationRef[i] + '</div> ';
		}

		// Add destination:int_ref
		for (var i = 0; i < destinationIntRef.length; i++) {
			html += 			'<div class="intRefText">' + destinationIntRef[i] + '</div> ';
		}

		html += 			'</td>' +
						'</tr></table>' + 
						'<div class="symbolsHolder">';

		// Add destination:symbol
		for (var i = 0; i < destinationSymbol.length; i++) {
			html += 		htmlSymbol(destinationSymbol[i], country);
		}

		html +=			'</div>' +
					'</div>';
	}

	html += 		'<div class="lanesHolder">';

	for (var i = 0; i < lanes; i++) {

		if (i == selectedLane) {
			var opacity = '1';
			var link = null;
		} else {
			var opacity = '0.7';
			var link = i;
		}

		var span = 1;
		for (var j = 1; j + i < lanes; j++) {
			if (destinationLanes[i + j] == destinationLanes[i] &&
				destinationStreetLanes[i + j] == destinationStreetLanes[i] &&
				destinationRefLanes[i + j] == destinationRefLanes[i] &&
				destinationIntRefLanes[i + j] == destinationIntRefLanes[i] &&
				destinationSymbolLanes[i + j] == destinationSymbolLanes[i]) {
				var span = j + 1;
			} else {
				break;
			}
		}

		if (destinationLanes[i] == destinationLanes[i - 1] &&
			destinationStreetLanes[i] == destinationStreetLanes[i - 1] &&
			destinationRefLanes[i] == destinationRefLanes[i - 1] &&
			destinationIntRefLanes[i] == destinationIntRefLanes[i - 1] &&
			destinationSymbolLanes[i] == destinationSymbolLanes[i - 1]) {
			continue;
		}

		html +=			'<div style="flex-basis: 0; flex-grow: ' + span + '; opacity: ' + opacity + ';">';
		if (destinationLanes[i] && destinationLanes[i] != 'none' ||
			destinationStreetLanes[i] && destinationStreetLanes[i] != 'none' || 
			destinationRefLanes[i] && destinationRefLanes[i] != 'none' ||
			destinationIntRefLanes[i] && destinationIntRefLanes[i] != 'none' ||
			destinationSymbolLanes[i] && destinationSymbolLanes[i] != 'none') {
			html +=			'<div class="subPanel" onClick="way[' + wayElement.wayID + '].sidebarDestinationLanes(' + link + ');">' +
								'<i class="fa fa-ellipsis-h"></i>' +
							'</div>';
		}
		html +=			'</div>';
	}

	html += 		'</div>' +
				'</div>' +
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

function htmlPrevNext (element) {
	var type = element.type;
	var html = '<div id="prevnext"><div id="prev">';
	if (element.prev.length>0) {
		html += '<p><i class="fa fa-arrow-left"></i></p>';
		for (var i = 0; i < element.prev.length; i++) {
			var id = element.prev[i].wayID||element.prev[i].nodeID;
			html += '<p><a href="javascript:;" '+
				'onClick="'+type+'['+id+'].zoom();'+
				''+type+'['+id+'].sidebar();">'+id+'</a></p>';
		};
	};
	html+='</div><div id="next">'
	if (element.next.length>0) {
		html += '<p><i class="fa fa-arrow-right"></i></p>';
		for (var i = 0; i < element.next.length; i++) {
			var id = element.next[i].wayID||element.next[i].nodeID;
			html += '<p><a href="javascript:;" '+
				'onClick="'+type+'['+id+'].zoom();'+
				''+type+'['+id+'].sidebar();">'+id+'</a></p>';
		};
	};
	html += '</div></div>';
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
