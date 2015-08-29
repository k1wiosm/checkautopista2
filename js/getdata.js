fw = [];
function Freeway(relID, name) {
	this.relID = relID;
	this.name = name;
	this.ref = undefined;
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
Freeway.prototype.getFreewayData = function(timeout) {
	var timeout = timeout || 4;
	console.log('Loading freeway data');
	console.time('getFreewayData');
	var query = '[out:json][timeout:'+timeout+'];(relation('+this.relID+');way(r);node(w););out bb body qt;';
	var fw = this;
	rq1[this.relID] = $.getJSON('http://overpass-api.de/api/interpreter?data=' + query,
		function (response) {
			if(response.remark!=undefined){ console.log('ERROR: Timeout when loading freeway data in '+fw.relID); fw.getFreewayData(timeout+5); return; }
			fw.timestamp = new Date(response.osm3s.timestamp_osm_base);
			for (var i = 0; i < response.elements.length; i++) {
				// Get info from relation
				if (response.elements[i].type=='relation'){
					fw.name = response.elements[i].tags.name;
					fw.ref = response.elements[i].tags.ref;
					fw.bounds = response.elements[i].bounds;
					for (var j = 0; j < response.elements[i].members.length; j++) {
						if (response.elements[i].members[j].type=='way') {
							fw.waysIDs.push(response.elements[i].members[j].ref);
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
							node[ex.nodeID] = ex;
							if (response.elements[i].tags.ref!=undefined) {
								ex.ref=response.elements[i].tags.ref;
							};
							if (response.elements[i].tags.name!=undefined) {
								ex.name=response.elements[i].tags.name;
							};
							if (response.elements[i].tags.exit_to!=undefined) {
								ex.exit_to=response.elements[i].tags.exit_to;
							};
							fw.exits.push(ex);
							// Get info from toll_booths
						} else if (response.elements[i].tags.barrier=='toll_booth') {
							node[response.elements[i].id] = new Node(response.elements[i]);
							fw.tolls.push(node[response.elements[i].id]);
						} else {
							fw.otherNodesIDs.push(response.elements[i].id);
							node[response.elements[i].id] = new Node(response.elements[i]);
						};
					} else {
						fw.otherNodesIDs.push(response.elements[i].id);
						node[response.elements[i].id] = new Node(response.elements[i]);
					};
					// Get info from ways
				} else if (response.elements[i].type=='way') {
					way[response.elements[i].id] = new Way(response.elements[i]);
				};
			};
			fw.loaded++;
			console.timeEnd('getFreewayData');
			fw.getAnalysis();
			fw.getDestinationUnmarked();
		}
	)
	.fail( function (response) {
		if (response.statusText!=='abort') { fw.getFreewayData(); console.log('ERROR: Unknown error when loading freeway data in '+fw.relID);
		} else { console.log('ERROR: Abort when loading freeway data in '+fw.relID); };
	});
}

rq2 = [];
Freeway.prototype.getDestinationUnmarked = function(timeout) {
	var timeout = timeout || 5;
	console.log('Loading destination & unmarked');
	console.time('getDestinationUnmarked');
	var query = '[out:json][timeout:'+timeout+'];relation('+this.relID+');way(r);node(w);way(bn);out body qt;';
	var fw = this;
	rq2[this.relID] = $.getJSON('http://overpass-api.de/api/interpreter?data=' + query,
		function (response) {
			if(response.remark!=undefined){ console.log('ERROR: Timeout when loading destination & unmarked in '+fw.relID); fw.getDestinationUnmarked(timeout+5); return; }
			// get Destination tags
			for (var i = 0; i < response.elements.length; i++) {
				if(!response.elements[i].tags) { continue; };
				if(!response.elements[i].tags.destination) { continue; };
				for (var j = 0; j < fw.exits.length; j++) {
					// Searching for the exit corresponding to fw destination tag
					if(fw.exits[j].nodeID==response.elements[i].nodes[0] || fw.exits[j].nodeID==response.elements[i].nodes[response.elements[i].nodes.length-1]){
						if (fw.exits[j].destination==undefined || response.elements[i].tags.highway=='motorway_link') {
							way[response.elements[i].id] = new Way(response.elements[i]);
							fw.exits[j].destination=response.elements[i].tags.destination;
							fw.exits[j].wayID=response.elements[i].id;
						};
					};
				};
			};
			// get Unmarked Exits
			for (var i = 0; i < response.elements.length; i++) {
				if (!response.elements[i].tags) { continue; };
				if (!response.elements[i].tags.highway) { continue; };
				if (['motorway_link','trunk_link','service'].indexOf(response.elements[i].tags.highway)==-1) { continue; };
				if (response.elements[i].tags.access=='no') { continue; };
				if (response.elements[i].tags.access=='private') { continue; };

				if (fw.waysIDs.indexOf(response.elements[i].id)==-1) {
					if (response.elements[i].tags.oneway=="-1") {
						var firstNode = response.elements[i].nodes[response.elements[i].nodes.length-1];
					} else {
						var firstNode = response.elements[i].nodes[0];
					};
					if (fw.otherNodesIDs.indexOf(firstNode)!=-1) {
						if (node[firstNode].tags!=undefined && (node[firstNode].tags.highway=='services' || node[firstNode].tags.highway=='rest_area')) { continue; };
						fw.unmarked.push(node[firstNode]);
					};
				};
			};
			fw.loaded++;
			console.timeEnd('getDestinationUnmarked');
			fw.getAnalysis();
			fw.getAreas();
		}
	)
	.fail( function (response) {
		if (response.statusText!=='abort') { fw.getDestinationUnmarked(); console.log('ERROR: Unknown error when loading destination & unmarked in '+fw.relID);
		} else { console.log('ERROR: Abort when loading destination & unmarked in '+fw.relID); };
	});
}

rq3 = [];
Freeway.prototype.getAreas = function(timeout) {
	var timeout = timeout || 25;
	console.log('Loading areas');
	console.time('getAreas');
	var query = '[out:json][timeout:'+timeout+'];relation(' + this.relID + ');way(r);node(w);(node(around:500)["highway"~"services|rest_' +
		'area"]->.x;way(around:500)["highway"~"services|rest_area"];);(._;>;);out center qt;';
	var fw = this;
	rq3[this.relID] = $.getJSON('http://overpass-api.de/api/interpreter?data=' + query,
		function (response) {
			if(response.remark!=undefined){ console.log('ERROR: Timeout when loading areas in '+fw.relID); fw.getAreas(timeout+10); return; }
			for (var i = 0; i < response.elements.length; i++) {
				if(!response.elements[i].tags) { continue; };
				if(!response.elements[i].tags.highway) { continue; };
				if(response.elements[i].tags.highway!=='services'&&response.elements[i].tags.highway!=='rest_area') { continue; };
				if(response.elements[i].type=='node') {
					node[response.elements[i].id] = new Node(response.elements[i]);
					fw.areasNode.push(node[response.elements[i].id]);
				} else if (response.elements[i].type=='way') {
					way[response.elements[i].id] = new Way(response.elements[i]);
					way[response.elements[i].id].center = response.elements[i].center;
					fw.areasWay.push(way[response.elements[i].id]);
				};
			};
			for (var i = 0; i < response.elements.length; i++) {
				if (node[response.elements[i].id]==undefined) { node[response.elements[i].id] = new Node(response.elements[i]); };
			};
			fw.loaded++;
			console.timeEnd('getAreas');
			fw.getAnalysis();
		}
	)
	.fail( function (response) {
		if (response.statusText!=='abort') { fw.getAreas(); console.log('ERROR: Unknown error when loading areas in '+fw.relID);
		} else { console.log('ERROR: Abort when loading areas in '+fw.relID); };
	});
}
