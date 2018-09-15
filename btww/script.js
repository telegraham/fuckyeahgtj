$(function(){

	$.ajax({
		type: 'GET',
		url : "jitsu.json",  //"http://jsonp.jit.su/?callback=displayStandings&url=http%3A%2F%2Fwww.bikecommuterchallenge.org%2Fajax%2Fpaginated_teams%2F%3Fteam_name%3D%26category%3D4%26size%3D500%26page_number%3D1%26sort_column%3Drate%26ascending%3Dfalse",
		jsonp: "displayStandings",
		dataType: "jsonp",
	});

});

var org_map = {
	477 : "Rush",
	37 : "Northwestern",
	143 : "Lurie",
	451 : "Lurie",
	225 : "Masonic",
	133 : "Swedish Covenant",
	170 : "BCBS",
	87 : "Rotary",
	91 : "Field Museum",
	200 : "Moody",
	667 : "AHA"
}


function displayStandings(response){

	var viewData = { contenders : [], ticks : [] };

	var maxRegistration = 0;

	$.each(response.rows, function(index, element) {
		var registration = (element.total_riders / element.workplace_size);
		viewData.contenders.push({
			friendlyName : org_map[element.id] || element.name,
			registration : registration,
			participation : Math.random() * registration // parseFloat(element.rate)
		});
		maxRegistration = Math.max(maxRegistration, registration);
	});

	const percentOfProgressBarForMaximumRegistrationToShowAs = 90;
	var multiplicator = percentOfProgressBarForMaximumRegistrationToShowAs / maxRegistration;

	$.each(viewData.contenders, function(index, element) {
		$.extend(element, { 
			multiplicated_registration : multiplicator * element.registration,
			multiplicated_participation : multiplicator * element.participation
		});
	});

	for (var i = 0; (i / 100) * multiplicator < 100; i++) {
		viewData.ticks.push({
			label : i == 0 ? null : i,
			multiplicated_position : (i / 100) * multiplicator
		})
	};

	$.ajax({
		type: 'GET',
		url : "template.mustache",
		success : function(template) {
			var output = Mustache.render(template, viewData);
			$("#standings").append($(output));
		}
	});
}