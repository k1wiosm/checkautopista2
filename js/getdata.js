fw = [];
function Freeway(relID, name) {
	this.relID = relID;
	this.name = name;
	this.ref = undefined;
	this.tags = undefined;
	this.bounds = undefined;
	this.exits = [];
	this.tolls = [];
	this.areasNode = [];
	this.areasWay = [];
	this.unmarked = [];
	this.otherNodesIDs = [];
	this.waysIDs = [];
	this.loaded = 0;
	this.analysis = new Analysis();
	this.timestamp = undefined;
};

node = [];
function Node(element) {
	this.type = 'node';
	if(element!==undefined) {
		this.nodeID = element.id;
		this.lat = element.lat;
		this.lon = element.lon;
		this.tags = element.tags;
	} else {
		this.nodeID = undefined;
		this.lat = undefined;
		this.lon = undefined;
		this.tags = undefined;
	};
}

way = [];
function Way(element) {
	this.type = 'way';
	this.wayID = element.id;
	this.nodes = element.nodes;
	this.tags = element.tags;
}

function Exit() {
	this.subtype = 'exit';
	this.wayID = undefined;
	this.ref = undefined;
	this.name = undefined;
	this.exit_to = undefined;
	this.destination = undefined;
}

Exit.prototype = new Node();

rq1 = [];
Freeway.prototype.getFreewayData = function(opt) {
	if (!opt) { opt = {}; };
	if (!opt.timeout) { opt.timeout = 8; };
	console.log('Loading freeway data');
	console.time('getFreewayData');
	var query = '[out:json][timeout:'+opt.timeout+'];(relation('+this.relID+');way(r);node(w););out bb body qt;';
	var fwy = this;
	rq1[this.relID] = $.getJSON('http://overpass-api.de/api/interpreter?data=' + query,
		function (response) {
			if(response.remark!=undefined) {
				console.timeEnd('getFreewayData');
				console.log('ERROR: Timeout when loading freeway data'); opt.timeout+=5; fwy.getFreewayData(opt); return;
			};
			fwy.timestamp = new Date(response.osm3s.timestamp_osm_base);
			for (var i = 0; i < response.elements.length; i++) {
				// Get info from relation
				if (response.elements[i].type=='relation'){
					fwy.tags = response.elements[i].tags;
					fwy.name = response.elements[i].tags.name;
					fwy.ref = response.elements[i].tags.ref;
					fwy.bounds = response.elements[i].bounds;
					for (var j = 0; j < response.elements[i].members.length; j++) {
						if (response.elements[i].members[j].type=='way') {
							fwy.waysIDs.push(response.elements[i].members[j].ref);
						};
					};
				// Get info from nodes
				} else if (response.elements[i].type=='node') {
					if (response.elements[i].tags!=undefined) {
						// Get info from exits
						if (response.elements[i].tags.highway=='motorway_junction') {
							var ex = new Exit();
							ex.nodeID = response.elements[i].id;
							ex.lat = response.elements[i].lat;
							ex.lon = response.elements[i].lon;
							ex.tags = response.elements[i].tags;
							ex.ref=response.elements[i].tags.ref;
							ex.name=response.elements[i].tags.name;
							ex.exit_to=response.elements[i].tags.exit_to;
							node[ex.nodeID] = ex;
							fwy.exits.push(ex);
						// Get info from toll_booths
						} else if (response.elements[i].tags.barrier=='toll_booth') {
							node[response.elements[i].id] = new Node(response.elements[i]);
							fwy.tolls.push(node[response.elements[i].id]);
						} else {
							fwy.otherNodesIDs.push(response.elements[i].id);
							node[response.elements[i].id] = new Node(response.elements[i]);
						};
					} else {
						fwy.otherNodesIDs.push(response.elements[i].id);
						node[response.elements[i].id] = new Node(response.elements[i]);
					};
				// Get info from ways
				} else if (response.elements[i].type=='way') {
					way[response.elements[i].id] = new Way(response.elements[i]);
				};
			};
			if (opt && opt.zoom) { fwy.zoom() };
			fwy.loaded++;
			console.timeEnd('getFreewayData');
			fwy.getAnalysis();
			fwy.getDestinationUnmarked();
		}
	)
	.fail( function (response) {
		console.timeEnd('getFreewayData');
		if (response.statusText!=='abort') { console.log('ERROR: Unknown error when loading freeway data'); fwy.getFreewayData();
		} else { console.log('ERROR: Abort when loading freeway data'); };
	});
}

rq2 = [];
Freeway.prototype.getDestinationUnmarked = function(opt) {
	if (!opt) { opt = {}; };
	if (!opt.timeout) { opt.timeout = 8; };
	console.log('Loading destination & unmarked');
	console.time('getDestinationUnmarked');
	var query = '[out:json][timeout:'+opt.timeout+'];relation('+this.relID+');way(r);node(w);way(bn);out body qt;';
	var fwy = this;
	rq2[this.relID] = $.getJSON('http://overpass-api.de/api/interpreter?data=' + query,
		function (response) {
			if (response.remark!=undefined) {
				console.timeEnd('getDestinationUnmarked');
				console.log('ERROR: Timeout when loading destination & unmarked'); opt.timeout+=5; fwy.getDestinationUnmarked(opt); return; 
			};
			// get Destination tags
			for (var i = 0; i < response.elements.length; i++) {
				if(!response.elements[i].tags || !response.elements[i].tags.destination) { continue; };
				for (var j = 0; j < fwy.exits.length; j++) {
					// Searching for the exit corresponding to fwy destination tag
					if(fwy.exits[j].nodeID==response.elements[i].nodes[0] || fwy.exits[j].nodeID==response.elements[i].nodes[response.elements[i].nodes.length-1]){
						if (fwy.exits[j].destination==undefined || response.elements[i].tags.highway=='motorway_link') {
							way[response.elements[i].id] = new Way(response.elements[i]);
							fwy.exits[j].destination=response.elements[i].tags.destination;
							fwy.exits[j].wayID=response.elements[i].id;
						};
					};
				};
			};
			// get Unmarked Exits
			for (var i = 0; i < response.elements.length; i++) {
				if (!response.elements[i].tags || !response.elements[i].tags.highway) { continue; };
				if (['motorway_link','trunk_link','service'].indexOf(response.elements[i].tags.highway)==-1) { continue; };
				if (response.elements[i].tags.access=='no') { continue; };
				if (response.elements[i].tags.access=='private') { continue; };
				if (fwy.waysIDs.indexOf(response.elements[i].id)==-1) {
					if (response.elements[i].tags.oneway=="-1") {
						var firstNode = response.elements[i].nodes[response.elements[i].nodes.length-1];
					} else {
						var firstNode = response.elements[i].nodes[0];
					};
					if (fwy.otherNodesIDs.indexOf(firstNode)!=-1) {
						if (node[firstNode].tags!=undefined && (node[firstNode].tags.highway=='services' || node[firstNode].tags.highway=='rest_area')) { continue; };
						fwy.unmarked.push(node[firstNode]);
					};
				};
			};
			fwy.loaded++;
			console.timeEnd('getDestinationUnmarked');
			fwy.getAnalysis();
			fwy.getAreas();
		}
	)
	.fail( function (response) {
		console.timeEnd('getDestinationUnmarked');
		if (response.statusText!=='abort') { console.log('ERROR: Unknown error when loading destination & unmarked'); fwy.getDestinationUnmarked();
		} else { console.log('ERROR: Abort when loading destination & unmarked'); };
	});
}

rq3 = [];
Freeway.prototype.getAreas = function(opt) {
	if (!opt) { opt = {}; };
	if (!opt.timeout) { opt.timeout = 25; };
	console.log('Loading areas');
	console.time('getAreas');
	var query = '[out:json][timeout:'+opt.timeout+'];relation(' + this.relID + ');way(r);node(w);(node(around:500)["highway"~"services|rest_' +
		'area"]->.x;way(around:500)["highway"~"services|rest_area"];);(._;>;);out center qt;';
	var fwy = this;
	rq3[this.relID] = $.getJSON('http://overpass-api.de/api/interpreter?data=' + query,
		function (response) {
			if (response.remark!=undefined) { 
				console.timeEnd('getAreas');
				console.log('ERROR: Timeout when loading areas'); opt.timeout+=10; fwy.getAreas(opt); return; 
			};
			for (var i = 0; i < response.elements.length; i++) {
				if(!response.elements[i].tags || !response.elements[i].tags.highway) { continue; };
				if(response.elements[i].tags.highway!=='services'&&response.elements[i].tags.highway!=='rest_area') { continue; };
				if(response.elements[i].type=='node') {
					node[response.elements[i].id] = new Node(response.elements[i]);
					fwy.areasNode.push(node[response.elements[i].id]);
				} else if (response.elements[i].type=='way') {
					way[response.elements[i].id] = new Way(response.elements[i]);
					way[response.elements[i].id].center = response.elements[i].center;
					fwy.areasWay.push(way[response.elements[i].id]);
				};
			};
			for (var i = 0; i < response.elements.length; i++) {
				if (node[response.elements[i].id]==undefined) { node[response.elements[i].id] = new Node(response.elements[i]); };
			};
			fwy.loaded++;
			console.timeEnd('getAreas');
			fwy.getAnalysis();
		}
	)
	.fail( function (response) {
		console.timeEnd('getAreas');
		if (response.statusText!=='abort') { console.log('ERROR: Unknown error when loading areas'); fwy.getAreas();
		} else { console.log('ERROR: Abort when loading areas'); };
	});
}

function getFreeway (relID, opt) {
	killRequests();
	console.log('\nLoading freeway [relID='+relID+']');
	$('li#road i').attr('class', 'fa fa-spinner fa-spin'); $('li#road').toggleClass('disabled', false);
	$('li#stats i').attr('class', 'fa fa-spinner fa-spin');
	fw[relID] = new Freeway();
	fw[relID].relID = relID;
	fw[relID].getFreewayData(opt);
	updatePermalink(relID);
	ga('send', 'pageview', document.URL.split('/')[document.URL.split('/').length-2]+'/'+document.URL.split('/')[document.URL.split('/').length-1]);
	return fw[relID];
}

function searchInMap (opt) {
	if (!opt) { opt = {}; };
	if (!opt.timeout) { opt.timeout = 60; };
	killRequests();
	$('li#search i').attr('class', 'fa fa-spin fa-spinner');
	console.log('\nSearching in map');
	console.time('searchInMap');
	var query = '[out:json][timeout:'+opt.timeout+'];relation[route=road]('+
		map.getBounds().getSouth()+','+map.getBounds().getWest()+','+map.getBounds().getNorth()+','+map.getBounds().getEast()+
		');foreach(out tags; way(r); out tags 1 qt;);';
	rq0 = $.getJSON('http://overpass-api.de/api/interpreter?data=' + query,
		function (response) {
			if (response.remark!=undefined) { 
				console.timeEnd('searchInMap');
				console.log('ERROR: Timeout when searching in map'); opt.timeout+=60; searchInMap(opt); return; 
			};
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
			if (fwVisible.length > 0) {
				$('div#searchInMap button.download,div#searchInMap select').prop('disabled', false);
			} else {
				$('div#searchInMap button.download,div#searchInMap select').prop('disabled', true);
			};
			$("div#searchInMap select").html('');
			for (var i = 0; i < fwVisible.length; i++) { $("div#searchInMap select").append('<option value="'+fwVisible[i].relID+'">'+fwVisible[i].ref+'</option>'); };
			console.timeEnd('searchInMap');
			console.log('Done');
		}
	)
	.fail( function (response) {
		console.timeEnd('searchInMap');
		if (response.statusText!=='abort') { console.log('ERROR: Unknown error when searching in map'); searchInMap();
		} else { console.log('ERROR: Abort when searching in map'); };
	});
}

function searchByProp (opt) {
	if (!opt) { opt = {}; };
	if (!opt.timeout) { opt.timeout = 20; };
	killRequests();
	$('li#search i').attr('class', 'fa fa-spin fa-spinner');
	console.log('\nSearching by properties');
	console.time('searchByProp');
	var query = '[out:json][timeout:'+opt.timeout+'];relation[route=road]('+
		map.getBounds().getSouth()+','+map.getBounds().getWest()+','+map.getBounds().getNorth()+','+map.getBounds().getEast()+
		');foreach(out tags; way(r); out tags 1 qt;);';
	rq0 = $.getJSON('http://overpass-api.de/api/interpreter?data=' + query,
		function (response) {
			if (response.remark!=undefined) { 
				console.timeEnd('searchInMap');
				console.log('ERROR: Timeout when searching by properties'); opt.timeout+=60; searchInMap(opt); return; 
			};
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
			if (fwVisible.length > 0) {
				$('searchbyProp button#download,select#visible').prop('disabled', false);
			} else {
				$('searchbyProp button#download,select#visible').prop('disabled', true);
			};
			$("select#visible").html('');
			for (var i = 0; i < fwVisible.length; i++) { $("select#visible").append('<option value="'+fwVisible[i].relID+'">'+fwVisible[i].ref+'</option>'); };
			console.timeEnd('searchByProp');
			console.log('Done');
		}
	)
	.fail( function (response) {
		console.timeEnd('searchInMap');
		if (response.statusText!=='abort') { console.log('ERROR: Unknown error when searching by properties'); searchInMap();
		} else { console.log('ERROR: Abort when searching by properties'); };
	});
}

function killRequests() {
	if (typeof rq0 !== 'undefined') {rq0.abort(); };
	if (typeof rq1[options.relID] !== 'undefined') {rq1[options.relID].abort(); };
	if (typeof rq2[options.relID] !== 'undefined') {rq2[options.relID].abort(); };
	if (typeof rq3[options.relID] !== 'undefined') {rq3[options.relID].abort(); };
	$('li#search i').attr('class', 'fa fa-search');
	$('li#road i').attr('class', 'fa fa-road');
	$('li#stats i').attr('class', 'fa fa-bar-chart');
}