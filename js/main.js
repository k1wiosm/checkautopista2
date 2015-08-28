console.log('CheckAutopista debugging');

var map = L.map('map', {
	center: [options.lat || 40.179, options.lon || -4.482],
	zoom: options.z || 6});

if (options.lat==undefined && options.lon==undefined && options.z== undefined) {
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

if (options.id!==undefined) { getFreeway(options.id); }

var ids = [4046477,404438,139852,139869,157375,359074,1297903,79784,1397970,2714593,76946,121011,3297420,4041086,4071872,
3987041,92876,358854,358842,4071893,4046361,3986098,
405060,4050073,4052503,1395281,4052472,4052413,
157377,157369,4071906,4054945,4046446,157374,4071913,
4071943,4050616,4071950,4071956,157376,4071972,300660,1813372,331776,4071974,
287515,4077800,4050920,4051418,2717676,4051452,4050869,73633,
4070861,1141919,4070935,4070970,4070980,4070987,12453,4071824,4071813,2909952,366395,283102,
157356,4072674,4066719,4072685,
4072688,300665];
var refs = ['A-1','AP-1','A-2','AP-2','A-3','A-4','AP-4','A-5','A-6','AP-6','A-7','AP-7','A-8','AP-8','AP-9',
'A-10','A-11','A-12','A-13','A-14','A-15','AP-15',
'A-21','A-22','A-23','A-24','A-26','A-27',
'A-30','A-31','A-32','A-33','A-35','AP-36','A-38',
'A-40','A-41','AP-41','A-42','A-43','A-44','A-45','AP-46','A-48','A-49',
'A-50','A-51','AP-51','A-52','AP-53','A-54','A-55','A-58',
'A-60','AP-61','A-62','A-63','A-64','A-65','A-66','AP-66','A-67','A-68','A-68','AP-68',
'A-70','AP-71','A-73','A-75',
'A-91','A-92M'];
if (options.country=='es') {
	$('div#search').append(
		'<div class="section"><table><tr>'+
			'<td class="fit"><img class="country" src="http://flags.fmcdn.net/data/flags/normal/'+options.country+'.png"></img>: </td>'+
			'<td><select id="byCountry"></select></td>'+
			'<td class="fit"><button onClick="getFreeway($('+"'select#byCountry'"+').val())"><i class="fa fa-cloud-download"></i></button></td>'+
        '</div>'
    );
    for (var i = 0; i < ids.length; i++) { $('select#byCountry').append('<option value="'+ids[i]+'">'+refs[i]+'</option>'); };
}

map.on('moveend', function(e) { updatePermalink(undefined, map.getCenter().lat, map.getCenter().lng, map.getZoom()); });

function getFreeway (relID) {
    if (typeof rq0 !== 'undefined') {rq0.abort(); };
    $('li#search i').attr('class', 'fa fa-search');
    console.log('\nLoading freeway relID='+relID);
    fw[relID] = new Freeway();
    fw[relID].relID = relID;
    fw[relID].getFreewayData();
    updatePermalink(relID);
    ga('send', 'pageview', document.URL.split('/')[document.URL.split('/').length-2]+'/'+document.URL.split('/')[document.URL.split('/').length-1]);
   $('li#stats i').attr('class', 'fa fa-spinner fa-spin'); $('li#stats').show();
    return fw[relID];
}

function searchInMap (timeout) {
	var timeout = timeout || 60;
    if (typeof rq0 !== 'undefined') {rq0.abort(); };
    $('li#search i').attr('class', 'fa fa-spin fa-spinner');
    console.log('\nSearching in map');
    var query = '[out:json][timeout:'+timeout+'];relation[route=road]('+
        map.getBounds().getSouth()+','+map.getBounds().getWest()+','+map.getBounds().getNorth()+','+map.getBounds().getEast()+');foreach(out tags; way(r); out tags 1 qt;);';
    rq0 = $.getJSON('http://overpass-api.de/api/interpreter?data=' + query,
        function (response) {
            if(response.remark!=undefined){ console.log('ERROR: Timeout when searching in map'); searchInMap(timeout+60); return; };
			$('li#search i').attr('class', ''); // IE/Edge Spinning Magnifying glass fix
			$('li#search i').attr('class', 'fa fa-search');
            var fwVisible = [];
            for (var i = 0; i < response.elements.length; i++) {
            	if (response.elements[i].type!=='relation') {continue; };
            	if (response.elements[i+1].type!=='way') {continue; };
            	if (response.elements[i+1].tags.highway=='motorway'||response.elements[i+1].tags.highway=='motorway_link'||
            		response.elements[i+1].tags.construction=='motorway'||response.elements[i+1].tags.construction=='motorway_link') {
            		fwVisible.push({relID:response.elements[i].id, ref:response.elements[i].tags.ref});
            	};
            };
            fwVisible.sort( function (a,b) { return a.ref > b.ref ? +1 : -1; });
            if (fwVisible.length > 0) { $('button#download,select#visible').prop('disabled', false); } else { $('button#download,select#visible').prop('disabled', true); };
            $("select#visible").html('');
            for (var i = 0; i < fwVisible.length; i++) { $("select#visible").append('<option value="'+fwVisible[i].relID+'">'+fwVisible[i].ref+'</option>'); };
        	console.log('Done');
        }
    )
    .fail( function (response) {
        if (response.statusText!=='abort') { searchInMap(); console.log('ERROR: Unknown error when searching in map');
        } else { console.log('ERROR: Abort when searching in map'); };
    });
}

function updatePermalink (relID, lat, lon, z) {
    options.lat = Number(lat || $.url().param('lat')).toFixed(4);
    options.lon = Number(lon || $.url().param('lon')).toFixed(4);
    options.z = z || $.url().param('z');
    options.relID = relID || ($.url().param('id') ? Number($.url().param('id')) : undefined);
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
    if (options.relID!==undefined) { url += '&id='+options.relID; };
    if (options.lat!==undefined) { url += '&lat='+options.lat; };
    if (options.lon!==undefined) { url += '&lon='+options.lon; };
    if (options.z!==undefined) { url += '&z='+options.z; };
	if (options.view!=='tdenxuaALMX') { url += '&view='+options.view; };
    if (options.country=='es') { url += '&country=es'; };
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
