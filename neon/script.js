function toggleLight(selector, on, duration)
{
	$(selector).toggleClass("on", on).fadeTo(50, on ? 1 : 0);
}

$(docReady);

function docReady()
{
	heavyImage = new Image(); 
	heavyImage.onLoad = imagesLoaded();
	heavyImage.src = "off.gif";	
}

function imagesLoaded()
{
	$(".switched").css("opacity", 0);
	$("#container").fadeIn(500);
	processQueue(0);
}

function processQueue(index)
{
	var item = Queue[index];
	toggleLight(item.Selector, item.On);
	var oneMore = ++index;
	var nextIndex = oneMore >= Queue.length ? 0 : oneMore;
	flicker(item.Duration);
	setTimeout("processQueue(" + nextIndex + ")", item.Duration);
}

function flicker(duration)
{
	if (random(10) == 0)
	{
		var whichOne = $(".on").eq(random($(".on").length));
		var flickers = random(8);

		whichOne.delay(random(duration - 100));
		for (var i=0;i<=flickers;i++)
		{

			whichOne.hide(0)
					.delay(1)
					.show(0)
					.delay(1);
		}
	}
}

function random(max)
{
	return Math.floor(Math.random() * max);
}

function QueueItem(selector, duration, on)
{
	this.Selector = selector;
	this.Duration = duration;
	this.On = on;
}

Queue =
[
	new QueueItem(".switched", 2000, false),
	new QueueItem("#outer", 1000, true),
	new QueueItem("#G", 1000, true),
	new QueueItem("#I", 1000, true),
	new QueueItem("#V", 1000, true),
	new QueueItem("#E", 1000, true),
	new QueueItem(".give", 500, false),
	new QueueItem("#UP, .give", 1000, true),
	new QueueItem("#UP, .give", 500, false),
	new QueueItem(".switched", 2000, true)
];
