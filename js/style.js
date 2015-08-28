var options = {
	radius: 6,
	opacity: 0.8,
	country: $.url().param('country'),
	lat: $.url().param('lat'),
	lon: $.url().param('lon'),
	z: $.url().param('z') || $.url().param('zoom'),
	id: $.url().param('id')
}

if (Cookies.get('radius')!==undefined) { options.radius = Number(Cookies.get('radius')); }
if (Cookies.get('opacity')!==undefined) { options.opacity = Number(Cookies.get('opacity')); }

colorToll = 'blue';
bgColorToll = '#8888FF';
colorExDest = 'green';
colorExExitTo = 'orange';
colorExName = '#1FFFFF';
colorExNone = '#B60000';
colorExUnmarked = 'black';
bgColorExUnmarked = 'grey';
colorExRef = '#00DB00';
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
			Cookies.set('opacity',options.opacity);
			mapDataLayer.eachLayer( function (layer) { if (layer.type=='marker') { layer.setStyle({opacity:options.opacity, fillOpacity:options.opacity}); }; });
		}
	});

	$('#sliderRadius').slider({
		min: 5,
		max: 20,
		value: options.radius,
		change: function (event, ui) {
			options.radius = $(this).slider('value');
			Cookies.set('radius',options.radius);
			mapDataLayer.eachLayer( function (layer) { if (layer.type=='marker') { layer.setRadius(options.radius).setStyle({weight:options.radius/2}); }; });
		}
	});

	$('.chk').change(function() {
		updateVisibility(this);
    });
})

function styleNode(node) {
	if (node.tags==undefined) { var color = {color: colorExUnmarked}; var fill = {fillColor: bgColorExUnmarked};
	} else if (node.tags.highway=='motorway_junction') {
		if (node.destination!=undefined) { var color = {color: colorExDest};
		} else if (node.exit_to!=undefined) { var color = {color: colorExExitTo};
		} else if (node.name!=undefined) { var color = {color: colorExName};
		} else { var color = {color: colorExNone}; };
		if (node.ref!=undefined) {var fill = {fillColor: colorExRef};
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
	if (tags==undefined) { var style = {color: wColorNone};
	} else if (tags.highway=='construction') { var style = {color: wColorConstruction};
	} else if (tags.highway=='proposed') { var style = {color: wColorProposed};
	} else if (tags.highway=='services' || tags.highway=='rest_area') { var style = {color: colorAreas, fillColor: bgColorAreas};
	} else if (!tags.maxspeed && !tags.lanes) { var style = {color: wColorNone};
	} else if (!tags.maxspeed) { var style = {color: wColorNoMaxspeed};
	} else if (!tags.lanes) { var style = {color: wColorNoLanes};
	} else { var style = {color: wColorAll};
	};
	return $.extend(style,{smoothFactor:2, opacity:0.7});
}


function htmlPanel (element) {
	var ref = element.ref || '&nbsp;';
	var dest = element.destination || element.exit_to || element.name || '&nbsp;';
	dest = dest.replace(/;/g, '</br>');
	if (element.wayID!=undefined && way[element.wayID].tags['destination:ref']!=undefined) {
		var dest_ref = '';
		var destRefArray = way[element.wayID].tags['destination:ref'].split(/;/g);
		for (var i = 0; i < destRefArray.length; i++) {
			dest_ref += '<div class="panelText ref '+getColorCode(destRefArray[i])+'">'+destRefArray[i]+'</div> ';
		};
	};
	if (element.wayID!=undefined && way[element.wayID].tags['destination:int_ref']!=undefined) {
		var dest_int_ref = '';
		var destIntRefArray = way[element.wayID].tags['destination:int_ref'].split(/;/g);
		for (var i = 0; i < destIntRefArray.length; i++) {
			dest_int_ref += '<div class="panelText ref '+getColorCode(destIntRefArray[i])+'">'+destIntRefArray[i]+'</div> ';
		};
	};
	var t_html = 	'<div class="panel">' +
						'<div class="subPanel ref"><img src="img/exit.svg" height="20px"/>'+ref.replace("<","&lt;")+'</div>' +
						'<div class="subPanel destination">'+
							'<table><tr>'+
								'<td class="destination">'+dest+'</td>'+
								'<td class="ref">'+(dest_int_ref!=undefined?dest_int_ref:'')+(dest_ref!=undefined?dest_ref:'')+'</td>'+
							'</tr></table>'+
						'</div>'+
					'</div>';
	return t_html;
}

function getColorCode (ref) {
	if (ref.search(RegExp(
		'^E-' //Europe
		))!=-1) {return 'greenE';}
	else if (ref.search(RegExp(
		'^ *A-|^ *AP-|'+ // ES:Spanish Motorways
		'^ *PA-|'+ // ES:Navarra
		'^ *S-[0-9]{2} *$|'+ // ES:Cantabria
		'^ *R-' // ES:Madrid
		))!=-1) {return 'blue';}
	else if (ref.search(RegExp(
		'^ *CA-1|'+ // ES:Cantabria
		'^ *NA-[0-9]{3} *$|'+ // ES:Navarra
		'^ *CL-' //ES:Castilla y leon
		))!=-1) {return 'es1';}
	else if (ref.search(RegExp(
		'^ *CA-2|'+ //ES:Cantabria
		'^ *AV-[0-9]{3} *$|^ *BU-[0-9]{3} *$|^ *LE-[0-9]{3} *$|^ *P-[0-9]{3} *$|^ *SA-[0-9]{3} *$|'+ // ES: Castilla y leon
		'^ *SG-[0-9]{3} *$|^ *SO-[0-9]{3} *$|^ *VA-[0-9]{3} *$|^ *ZA-[0-9]{3} *$' // ES: Castilla y leon
		))!=-1) {return 'es2';}
	else if (ref.search(RegExp(
		'^ *CA-|'+  // ES: Cantabria
		'^ *NA-[0-9]{4} *$|'+ // ES: Navarra
		'^ *AV-P-[0-9]{3} *$|^ *BU-[0-9]{4} *$|^ *BU-P-[0-9]{4} *$|^ *LE-[0-9]{4} *$|^ *P-[0-9]{3} *$|^ *P-P-[0-9]{4} *$|^ *PP-[0-9]{4} *$|'+ // ES: Castilla y leon
		'^ *DSA-[0-9]{3} *$|^ *SG-P-[0-9]{4} *$|^ *SG-V-[0-9]{4} *$|^ *SO-P-[0-9]{4} *$|^ *SO-[0-9]{3} *$|^ *VA-[0-9]{3} *$|'+ // ES: Castilla y leon
		'^ *VA-P-[0-9]{4} *$|^ *VP-[0-9]{4} *$|^ *VA-V-[0-9]{4} *$|^ *ZA-[0-9]{3} *$|^ *ZA-P-[0-9]{4} *$'  // ES: Castilla y leon
		))!=-1) {return 'es3';}
	else {return 'red';}
}