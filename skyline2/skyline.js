function makeWindows(settingsParam)
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
		if (windows.length < windowsForThisBuilding * 15)
		{
			var div = $("<span class='window'></span>");
			
			var width = Math.abs((randomInteger(-1,1) + randomInteger(-1,1) + randomInteger(-1,1)) * 2);
			var top = randomInteger(1, (buildingHeight - 1)/2) * 2 - building.data("offset");
			var left = randomInteger(0, buildingWidth - 1);
			
			var overhang = left + width - buildingWidth;
			if (overhang > 0)
				width = width - overhang;
			
			div.css({ 
					"top" : -top,
					"left" :  left,
					"width" : width,
					"background-color" : building.data("color")
				});
				
			var reflection = $("<span class='window reflection'></span>");
			
			reflection.css({ 
					"top" : top,
					"left" :  left,
					"background-color" : building.data("color"),
					opacity : .05
				});
				
			building.append(reflection);	
			building.append(div);	
		
		//}
		}
		else
		{
			AllBuildings.splice(index, 1);
		}
 
} 
 
function randomLightColor()
{
	return "#" 	+ randomInteger(225, 255).toString(16)
				+ randomInteger(225, 255).toString(16)
				+ randomInteger(225, 255).toString(16);
}
function randomInteger(min, max)
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
 
function random(min, max)
{
	return Math.random() * (max - min) + min;
}
 
function makeWindowsLoop()
{
	if (AllBuildings.length > 0)
	{
		makeWindows();
		setTimeout("makeWindowsLoop()", 1);
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
 
	var screen = $("#screen");
	
	screen.fadeTo(10000, 0, function(){ screen.remove() });
 
	makeWindowsLoop();
	blinkerOn();
});