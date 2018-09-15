function makeWindows(index, settingsParam)
{
	var defaultSettings = 
		{
			
		};
		
	var settings = {};	
		
	$.extend(settings, defaultSettings, settingsParam);
	
		var index = randomInteger(0, AllBuildings.length - 1);
		var building = AllBuildings[index];
		
		var buildingHeight = building.height();
		var buildingWidth = building.width();
		
		windowsForThisBuilding = buildingHeight * buildingWidth / 100;		
		
		//for (var i = 0 ; i <= windowsForThisBuilding; i++)
		//{
		var windows = building.children(".window");
		if (windows.length < windowsForThisBuilding * 10)
		{
			var div = $("<span id='w" + index + "' class='window'></span>");
			
			var width = Math.abs((randomInteger(-1,1) + randomInteger(-1,1) + randomInteger(-1,1)) * 3);
			var top = randomInteger(1, (buildingHeight - 1)/2) * 2 - building.data("offset");
			var left = randomInteger(0, buildingWidth - 1);
			
			var overhang = left + width - buildingWidth;
			if (overhang > 0)
				width = width - overhang;
			
			div.css({ 
					"top" : -top,
					"right" :  left,
					"width" : width,
					"background-color" : building.data("color")
				});
				
			 var reflection = $("<span id='wr" + index + "' class='window reflection w" + index + "'></span>");
			
			 reflection.css({ 
					 "top" : top,
					 "right" :  left,
					 "background-color" : building.data("color"),
					 opacity : .05
				 });
				
			building.append(reflection);	
			building.append(div);	
		
		}
		else
		{
			var justWindows = windows.not(".reflection");
			var ventana = justWindows.eq(randomInteger(0, justWindows.length - 1));
			
			$("#" + ventana.attr("id").replace("w", "wr")).remove(); //reflection
			ventana.remove();
		}
 
} 
 
function randomLightColor()
{
	return "#" 	+ randomInteger(255, 255).toString(16)
				+ randomInteger(165, 200).toString(16)
				+ randomInteger(30, 100).toString(16);
}
function randomInteger(min, max)
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
 
function random(min, max)
{
	return Math.random() * (max - min) + min;
}
 
function makeWindowsLoop(timeout, index)
{
	if (AllBuildings.length > 0)
	{
		if (timeout > 10)
			timeout = timeout - 5;
		
		makeWindows(index);
		setTimeout("makeWindowsLoop(" + timeout + ", " + ++index + ")", timeout);
	}
}

function blinkerOn()
{
	$(".blinker").fadeTo(400, 1);
	setTimeout("blinkerOff();", 2000); 
	//});
}
 
function blinkerOff()
{
	$(".blinker").fadeTo(400, 0);
	setTimeout("blinkerOn();", 1500); 
}

function makeSnow()
{
	var flake = $("<span class='snowflake'><span>");
	var z = Math.random();
	flake.data("z", z);
	var diameter = Math.round(2 * z) + 1;
	flake.css({
		width: diameter,
		height: diameter,
		top: -10,
		left: random(0, $(window).width())//,
		//opacity: (2 - z)/2
	});
	
	$("body").append(flake);
	
	flake.animate({ top : $(window).height() * (1 + z)/2}, 10000 * (1 - z) + 30000, "linear", function() { flake.fadeTo(100, 0, function() { flake.remove(); }); });
	
	setTimeout("makeSnow()", 1500);
}

function makePlane()
{
	var plane = $("<div class='plane'><span class='landinglight'></span><span class='landinglight'></span><div>");
	
	var margin = $(window).height() / 2 - $("#airspace").height();
	
	if (margin > 0)
	{
		var height = random(0, margin)
		plane.css({
			bottom: height,
			right: $(window).width()
		});
	
		$("#airspace").append(plane);
	
		plane.animate({ right : -4}, 100 * (margin) + 10000, "linear", function() { plane.remove(); });
	}
	
	setTimeout("makePlane()", 60000);
}


$(function() {
 
	AllBuildings = new Array();
	j = 0;
	
	$(".building").each(function(index)
	{
		var building = $(this);
	
		var buildingHeight = building.height();
		var buildingWidth = building.width();
		
		windowsForThisBuilding = buildingHeight * buildingWidth / 100;
		
		building.data("color", randomLightColor());
		building.data("offset", Math.round(index/2) == index/2 ? 0 : 1);
		
		for (var i = 0 ; i <= windowsForThisBuilding; i++)
			AllBuildings.push(building);
	});
 
	$("#title").fadeTo(0, 0);
	
	setTimeout("$(\"#title\").fadeTo(750, 1, function() { setTimeout(\"$('#title').fadeTo(750, 0);\", 10000) });", 7500);
 
	makeWindowsLoop(100, 0);
	blinkerOn();
	makeSnow();
});