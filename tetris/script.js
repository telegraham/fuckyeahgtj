//todo 

//margin of error to move left/right CHECK
//can rotate
//bounce under
//piece colors                CHECK
//next piece                    CHECK
//scoring
//lines disappear                CHECK MAYBE MAKE THEM FLASH WHITE
//relative sizing?                      NOPE BUT LOOKED INTO IT
//rotation offset on approx height                      CHECK
//rotation offset doesn't work on some rotations?
//rounding cheating even at the bottom of the board
//new game                                              CHECK BUT FIGURE OUT UI
//only put rows with a block in them into fallen    
//drop don't work                                       CHECK
//if you move too fast after rotating, you lose the offset because of stop()
//sometimes for an unknown reason the rotation offset on drop just doesn't happen

//css we could do for game over / pause / clear row
//white blocks
//black blocks
//desaturated blocks (hard but probably cool)
//

var o = [[1, 1],
        [1, 1]];
	 
var l = [[0, 2, 0],
        [0, 2, 0],
        [0, 2, 2]];
	 
var j = [[0, 3, 0],
        [0, 3, 0],
        [3, 3, 0]];
	 
var s = [[ 4, 0],
        [ 4, 4],
        [ 0, 4]];
	 
var z = [[0, 5],
        [5, 5],
        [5, 0]];
	 
var t = [[0, 6, 0],
        [0, 6, 6],
        [0, 6, 0]];
	 
var i = [[0, 7, 0],
        [0, 7, 0],
        [0, 7, 0],
        [0, 7, 0]];
        
var basePx = 32;
	 
var pieces = [o, l, j, s, z, t, i];
var colors = ["clear", "yellow", "orange", "blue", "green", "red", "purple", "cyan"]

var currentPieceIndex = null;
var nextPieceIndex = null;

var board = [];
var boardHeight = 24;
var boardWidth = 10;

var clearedRows = 0;

var dropping = false;
var pausing = false;
var gameOver = true;

var pauseGravityTimeout = null;

var prodMode = false;

function debug()
{
	if (!prodMode)
		prodMode = !(window.location.search && window.location.search.indexOf('debug') != -1);
	return !prodMode;
}

function setUpBoard()
{
    if (board.length)
        board = [];
	for (k = 0; k < boardHeight; k++) {
		board.push(getBoardRow());
	}
}

function getBoardRow()
{
    var row = new Array();
    for (j = 0; j < boardWidth; j++) {
        row.push(0);
    }
    return row;
}

function getRandomInteger(min, max)
{
	return Math.floor(Math.random() * (max + 1)) + min;
}

function setNextPiece()
{
	var pieceIndex = getRandomInteger(0, pieces.length - 1);
	
	if (window.location.hash)
	{
		piece = window.location.hash.replace("#", "");
		
		if (piece == "o")
			pieceIndex = 0;
		else if (piece == "l")
			pieceIndex = 1;
		else if (piece == "j")
			pieceIndex = 2;
		else if (piece == "s")
			pieceIndex = 3;
		else if (piece == "z")
			pieceIndex = 4;
		else if (piece == "t")
			pieceIndex = 5;
		else if (piece == "i")
			pieceIndex = 6;
	};
		
    nextPieceIndex = pieceIndex;
}

function getPieceHtml(piece)
{
	var html = "<div class='blockcontainer'>";
	
    html += getHtmlForArray(piece);
			
	html += "</div>";
	return html;
}

function getHtmlForArray(array)
{
    var html = "";
	for(k = 0; k < array.length; k++) {
        html += "<div class='row" + k + "'>";
		for(j = 0; j < array[k].length; j++)
			html += getBlockForBool(array[k][j]);
		html += "</div>";
    }
    return html;
}

function getBlockForBool(bool)
{
    return "<div class='block " + colors[bool] + "'></div>";
}

function rotate(clock)
{
    if (gameOver || pausing)
        return;

	var current = $(".current");
			
	//current.addClass("rotating");

	var oldRotation = current.data("rotation");
	var offset = current.data("offset");
	
	if (!oldRotation)
		oldRotation = 0;
        
    var rotation = oldRotation + (clock ? 90 : -90);
        
    var trueHeight = getTrueHeight(current);
    var left = current.data("left");
        
    if (canMoveOrRotate(trueHeight, left, rotation))
    {
        current.removeClass("r" + oldRotation % 360);
        
        current.data("rotation", rotation);

        var left = current.data("left");
        var approxHeight = getApproxHeight(current);
        reFindCeiling(current, left, approxHeight, rotation);

        current.rotate({ animateTo: rotation, duration: 200});

        var blockWidth = current.find(".block").first().width();

        //assumes square blocks
        if (current.width() / blockWidth % 2 != current.height() / blockWidth % 2) {
            offset = !offset;
            var leftPx = getLeftPx(left, offset);
            current.animate({ left: leftPx }, { duration: 180, queue: false});
            current.data("offset", offset);
        }

        current.addClass("r" + rotation % 360);
    }
}


function getApproxHeight(block)
{
	return Math.round(getTrueHeight(block));
}

function getTrueHeight(block)
{
    var blockOuterHeight = block.outerHeight();
    var blockOuterWidth = block.outerWidth();
    var rotation = block.data("rotation");
    var rotationOffset = getRotationOffset(rotation, blockOuterHeight, blockOuterWidth);
	return (boardHeight * basePx - (stripPx(block.css("bottom")) + block.outerHeight()) + rotationOffset) / basePx;
}

function reFindCeiling(current, leftVal, approxHeight, rotation)
{
	var ceiling = current.data("ceiling");
	var newCeiling = findCeiling(leftVal, approxHeight, rotation);
	
	if (ceiling != newCeiling){
		current.data("ceiling", newCeiling);
		current.stop(true, false);
		gravity();
	}
}

function move(right)
{

    if (gameOver || pausing)
        return;
    
	var current = $(".current");
	
	var leftVal = current.data("left");
    var trueHeight = getTrueHeight(current);
	var approxHeight = getApproxHeight(current);
	var rotation = current.data("rotation");
	
    var proposedLeft = leftVal + (right ? 1 : -1);
    
	if (canMoveOrRotate(trueHeight, proposedLeft, rotation))
	{
		leftVal += (right ? 1 : -1);
		current.data("left", leftVal);

		var leftPx = getLeftPx(leftVal, current.data("offset"));
		
		reFindCeiling(current, leftVal, approxHeight, rotation);
		
		current.animate({ left: leftPx }, { duration: 100, easing: "linear", queue: false});

	}
	else
	{
		//maybe do a cute bounce-off-the-wall animation
	}
    
    if (debug())
    {
        printArray(approxHeight, leftVal, rotation);
        $("#approxHeight").css({"opacity" : "1", "top" : approxHeight * basePx}).fadeTo(2000, 0);
    }
}

function getLeftPx(left, offset)
{
	return left * basePx + ( offset ? basePx / 2 : 0);	
}

function gravity()
{
    drop(50 + clearedRows, "easeOutBounce");
}
 
function drop(rate, easing, altCallback)//pixels per second
{
	var block = $(".current");
	
	var left = block.data("left");
	var ceiling = block.data("ceiling");
	var rotation = block.data("rotation");
	
	if (!ceiling){
		ceiling = findCeiling(left, getApproxHeight(block), rotation);
		block.data("ceiling", ceiling);
	}

	var blockOuterHeight = block.outerHeight();
	var blockOuterWidth = block.outerWidth();
	var rotationOffset = getRotationOffset(rotation, blockOuterHeight, blockOuterWidth);
	
	if (debug())
		console.log("rotation offset: " + rotationOffset);
		
	var bottom = basePx * boardHeight - (ceiling * basePx + blockOuterHeight - rotationOffset);
	var distanceToGo = stripPx(block.css("bottom")) - bottom;
	
	block.animate({ "bottom" : bottom }, getMsForAnim(distanceToGo, rate), easing, altCallback || dropFinished);
}

function getRotationOffset(rotation, blockOuterHeight, blockOuterWidth)
{
    return ((rotation % 180 == 90) ? (Math.abs(blockOuterHeight - blockOuterWidth)/2) : 0);
}

function dropFinished()
{
	var block = $(".current");
	
	var ceiling = block.data("ceiling");
	var left = block.data("left");
	var rotation = block.data("rotation");
	
	var endgame = addBlockToBoard(ceiling, left, rotation); 
	
	block.remove();
    
    updateFallen();
    
    var fullLines = getFullLines();
    clearedRows += fullLines.length;
    
    $("#score").html(clearedRows);
    
    dealWithFullLines(fullLines);
	
	if (!endgame){
		newPiece();
    }
    else
    {
        gameOver = true;
        $("#next").fadeOut(500, function() { $("#gameover").fadeIn(500); });
    }
	
	if (debug())
		printArray();
}

function updateFallen()
{
    var fallen = $("#fallen");
    fallen.empty();
    fallen.append(getHtmlForArray(board));
}

function getFullLines()
{
    var lines = [];
    for (var k = 0; k < board.length; k++)
	{
        var len = board[k].length;
        var filled = 0;
        for (var j = 0; j < len; j++)
            if (board[k][j]) filled ++;
        if (filled == len)
            lines.push(k);
        
    }
    
    lines.reverse(); // so we can remove them without buggery
    
    var empties = [];
    for (var l = 0; l < lines.length; l++)
    {
        board.splice(lines[l], 1);
        empties.push(getBoardRow());
    }
    board = empties.concat(board);
    
    return lines;
}
function dealWithFullLines(lines)
{
    if (!lines.length)
        return;
        
    $(".row" + lines.join(", .row")).fadeTo(500, 0).slideUp(500, function() { $(this).remove(); });
    
}
 
function startDrop()
{
    if (!gameOver && !pausing)
    {
        var block = $(".current");
        if (!dropping)
        {
            dropping = true;
            block.stop(true, false);
            drop(500, "easeOutBounce");
        }
    }
}

function playPause()
{
    if (gameOver)
    {
        gameOver = false;
        clearedRows = 0;
        setUpBoard();
        $("#next").empty();
        $("#score").html(clearedRows);
        
        var oldGame = $("#fallen").children();
        if (oldGame.length)
            oldGame.fadeOut(1000, function() { $(this).remove(); });
        
        $("#welcome:visible, #gameover:visible").fadeOut(1000, function () { $("#next").show(); });
        
        setTimeout("newPiece(true);", 1000);
    }
    else
    {
        pause();
    }
}

function pause()
{
    var block = $(".current");
    
    var next = $("#next");
    var pause = $("#pause"); 
    
    var hider, shower;
              
    next.stop(true, false);
    pause.stop(true, false);
        
	if (!pausing)
	{
		pausing = true;
        
        if (pauseGravityTimeout)
            clearTimeout(pauseGravityTimeout);
        
        block.stop(true, false);
        
        hider = next;
        shower = pause;
            
        opacity = .5;
	}
    else
    {
        pausing = false;

        hider = pause;
        shower = next;
            
        opacity = 1;
        
        pauseGravityTimeout = setTimeout("gravity();", 1000);
    }
    
    if (hider.is(":visible"))
        hider.fadeOut(500, function() { shower.fadeIn(500); });
    else
        shower.fadeIn(500);
            
    $("#board").stop(true, false).fadeTo(1000, opacity);
}

function stopDrop()
{
    if (!gameOver && !pausing)
    {
        dropping = false;
        $(".current").stop(true, false);
        gravity();
    }
}
function getMsForAnim(distance, rate)
{
	return distance / (rate / 1000);
}
 
function stripPx(stringCss)
{
	return parseInt(stringCss.replace("px", ""));
}
 
 function newPiece(newGame)
 {
    if (nextPieceIndex == null || newGame)
        setNextPiece();
    
    currentPieceIndex = nextPieceIndex;
    setNextPiece();
    
 	var piece = $(getPieceHtml(pieces[currentPieceIndex]));
	
	if (debug())
		piece.children(".clear").css({"background-color":"black", "opacity":".2"});
	
	piece.data("rotation", 0);
    
    var startPos = 4;
	piece.data("left", startPos);
	piece.css("left", startPos * basePx);
    
    piece.addClass("current"); //bless
    
	$("#board").append(piece);

	gravity();
    
    if (nextPieceIndex != currentPieceIndex || newGame)
    {
        var nextPiece = $(getPieceHtml(pieces[nextPieceIndex]));
        
        nextPiece.hide();
        
        var fadeInNextPiece = function () { $("#next").append(nextPiece);
                                            nextPiece.fadeIn(); };
        
        var oldNextPiece = $("#next").children();
        
        if (oldNextPiece.length > 0)
            oldNextPiece.fadeOut("500", function() { $(this).remove(); fadeInNextPiece() });
        else
            fadeInNextPiece();
    }
 }
 
 function printArray(top, left, rotation)
 {
	$("#array").remove();
	var html = "<table id='array' style='position: fixed;right: 0px;padding:1px;'>";
	for (var y = 0; y < board.length; y++)
		{
			html += "<tr id='y" + y + "'>";
			for (var x = 0; x < board[y].length; x++)
			{	
            
                var color = (board[y][x] ? "black" : "#aaa");
                
                if (top != null && left != null && rotation != null)
                {
                    var piece = pieces[currentPieceIndex];
                    if (y >= top && y < top + getPieceHeight(piece, rotation))
                    {
                    
                        if (x >= left && x < left + getPieceWidth(piece, rotation, y))
                        {
                            var piecePixel = getPiecePixel(piece, x - left, y - top, rotation);
                
                            if (piecePixel)
                                color = "red";
                        }
                    }
                }
                
				html += "<td id='x" + x + "' style='width:10px;height:10px;background-color:" + color + ";'></td>";
			}
			html += "</tr>";
		}
        

		
	$("body").prepend(html + "</table>");
 }

 
 function findCeiling(left, height, rotation)
 {
	piece = pieces[currentPieceIndex];
    
	for (var k = height; k < board.length; k++)
	{
        var pieceHeight = getPieceHeight(piece, rotation);
    
		for (var y = 0; y < pieceHeight; y++)
		{
        
			for (var x = 0; x < getPieceWidth(piece, rotation, y); x++)
			{	
				//if (debug() && getPiecePixel(piece, x, y, rotation))
				//	$("#y" + (y + k)  + " > #x" + (x + left)).css("background-color", "red");
                
                var row = board[y + k];
                
                var pixel = getPiecePixel(piece, x, y, rotation);
                
                //if the current pixel is out of bounds but 0
                if (!row && !pixel)
                    continue; //that's ok, and skip the next check because it will throw an exception
                
                //if that pixel is out of bounds and 1 though,
                //or if the pixel is on on the board
                if ((!row && pixel) || (pixel && row[x + left]))
                {
                    
                    if (debug())
                        $("#floor").css("bottom", boardHeight * basePx - ((k - 1) * basePx + pieceHeight * basePx));
                        $("#cieling").css("bottom", boardHeight * basePx - ((k - 1) * basePx));
						
                    return k - 1;
                }
			}
		}
	}
 }
 
 function addBlockToBoard(ceiling, left, rotation)
 {
	var endgame = false;
	piece = pieces[currentPieceIndex];
	for (var y = 0; y < getPieceHeight(piece, rotation); y++)
		{
			for (var x = 0; x < getPieceWidth(piece, rotation, y); x++)
			{	
				var piecePixel = getPiecePixel(piece, x, y, rotation);
                
                if (!piecePixel)
                    continue; //because it could be a padder row in undefined space;
                
				board[y + ceiling][x + left] = (piecePixel || board[y + ceiling][x + left]);
				endgame = endgame || ((piecePixel || board[y + ceiling][x + left]) && (y + ceiling < 4));
			}
		}
	return endgame;
 }
 
 function canMoveOrRotate(height, proposedLeft, proposedRotation)
 {
	piece = pieces[currentPieceIndex];
    
    var pieceWidth =  getPieceWidth(piece, proposedRotation);
    
    var margin = Math.round(height) - height;
	
	for (var y = 0; y < getPieceHeight(piece, proposedRotation); y++)
		{
			for (var x = 0; x < pieceWidth; x++)
			{	
                
                var piecePixel = getPiecePixel(piece, x, y, proposedRotation);
                
                if (!piecePixel)
                    continue; //optimize a little
                
                var row = board[y + Math.round(height)];
                
                if (piecePixel && (x + proposedLeft < 0 || !row || x + proposedLeft > row.length - 1))
                    return false; //pixel oob
                
				if (piecePixel && row[x + proposedLeft])
					return false; //other piece
                
                var cornerDirection = (margin < 0 ? 1 : -1);
                
                if (debug())
                {
                    console.log("cornerDirection: " + cornerDirection);
                    console.log("margin: " + margin);
                }
                
                var corneringRow = board[y + Math.round(height) + cornerDirection];
                
                if ((piecePixel && corneringRow && corneringRow[x + proposedLeft])
                    && (Math.abs(margin) > .25 || margin < 0))
                    return false; //cornering, margin too small or rounding down height
			}
		}
		
	return true;
 }
 
 function getIncrement(rotation)
 {
	return (rotation % 360) / 90;
 }
 
 function getPiecePixel(piece, x, y, rotation) 
 {
	var increment = getIncrement(rotation);
	
	if (increment == 0)
		return piece[y][x];
	else if (increment == 1)
		return piece[piece.length - 1 - x][y];
	else if (increment == 2)
		return piece[piece.length - 1 - y][piece[0].length - 1 - x];
	else if (increment == 3)
		return piece[x][piece[0].length - 1 - y];
 }
 
 function getPieceHeight(piece, rotation)
 {
	var increment = getIncrement(rotation);
	return ((increment == 0 || increment == 2) ? piece.length : piece[0].length);
 }
 
 function getPieceWidth(piece, rotation)
 {
	var increment = getIncrement(rotation);
 	return ((increment == 0 || increment == 2) ? piece[0].length : piece.length);
 }
 
 

$(function () {

	setUpBoard();
	
	if (debug())
	{
		$("#board").append('<div id="floor" style="position:absolute;float:left;background-color:red;height:2px;width:100%;left:0;"></div>');
		$("#board").append('<div id="cieling" style="position:absolute;float:left;background-color:blue;height:2px;width:100%;left:0;"></div>');
        
        $("#board").append('<div id="approxHeight" style="opacity:0;position:absolute;float:left;background-color:purple;height:2px;width:100%;left:0;"></div>');
		
		$("body").prepend('<div style="position:fixed;left:0px;"><a href="#o">o</a><a href="#l">l</a><a href="#j">j</a><a href="#s">s</a><a href="#z">z</a><a href="#t">t</a><a href="#i">i</a></div>');
		
		printArray();
	}
	
	$(window).keydown(function(e) {
		if (e.which == 40) //down
		{
			startDrop();
		}
		else if (e.which == 38) // up
		{
			rotate(true);
		}
		else if (e.which == 37) // left
		{
			move(false);
		}
		else if (e.which == 39) // right
		{
			move(true);
		}
        else if (e.which == 32) // spacebar
		{
			playPause();
		}
 
	});
	$(window).keyup(function(e) {
		if (e.which == 40) //down
		{
			stopDrop();
		}
 
	});
});

