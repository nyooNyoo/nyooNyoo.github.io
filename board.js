
function CanvasBoard(matrixBoard, game) {
	this.stage = (typeof createjs != "undefined") && new createjs.Stage("boardGame");
	this.currentgame = game;

	this.matrixBoard = JSON.parse(JSON.stringify(matrixBoard)) || [
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0]
	];
};

CanvasBoard.prototype.initBoard = function () {
	var board = this;
	board.stage.name = "stage";
	board.stage.enableMouseOver(20);
	
	//Draw board
	var boardBackground = board.stage.addChild(new createjs.Shape()).set({ name: "background", x: 0, y: 0 });
	boardBackground.graphics.beginFill("#0277BD").beginStroke("black").drawRect(60, 10, 380, 330);

	//Draw checkers
	board.checkerSpaceContainer = board.stage.addChild(new createjs.Container()).set({ name: "board" });
	_.forEach(board.matrixBoard, function (row, rowIndex) {
		_.forEach(row, function (column, columnIndex) {
			var checkerSpace = board.checkerSpaceContainer.addChild(new createjs.Shape()).set({ name: "cs-" + rowIndex + columnIndex, x: 100 + (50 * columnIndex), y: 50 + (50 * rowIndex) });
			checkerSpace.graphics.beginFill("#222").beginStroke("grey").drawCircle(0, 0, 23);
			checkerSpace.cursor = "pointer";
			checkerSpace.addEventListener("click", (board.currentgame.placeHumanMove).bind(board.currentgame) );
		});
	});
	board.stage.on('click', function(e){
		if(board.isClickDisabled){
			e.stopPropagation();
		};
	}, null, false, {}, true);

	createjs.Ticker.addEventListener("tick", board.stage);
}

CanvasBoard.prototype.resetBoard = function () {
	var board = this;
	_.forEach(board.matrixBoard, function (row, rowIndex) {
		_.forEach(row, function (column, columnIndex) {
			var checkerSpace = board.checkerSpaceContainer.getChildByName("cs-" + rowIndex + columnIndex);
			checkerSpace.graphics.beginFill("#FFFF").beginStroke("grey").drawCircle(0, 0, 23);
			board.matrixBoard[rowIndex][columnIndex] = 0 ;
		});
	});
}

CanvasBoard.prototype.refreshBoard = function () {
	var board = this;
	_.forEach(board.matrixBoard, function (row, rowIndex) {
		_.forEach(row, function (column, columnIndex) {
			var checkerSpace = board.checkerSpaceContainer.getChildByName("cs-" + rowIndex + columnIndex);
			if(board.matrixBoard[rowIndex][columnIndex] == Config.HUMAN_PLAYER){
				checkerSpace.graphics.beginFill("#f70202").beginStroke("grey").drawCircle(0, 0, 23);
			}else if(board.matrixBoard[rowIndex][columnIndex] == Config.COMPUTER_AI){
				checkerSpace.graphics.beginFill("#ffc107").beginStroke("grey").drawCircle(0, 0, 23);
			}	
		});
	});
}

CanvasBoard.prototype.placeMove = function (player, columnMove, newBoard) {
	var board = newBoard ? new CanvasBoard(this.matrixBoard) : this;
	for(var i = Config.ROWS_SIZE-1; i >= 0 ; i--){
		if(board.matrixBoard[i][columnMove] == 0){
			board.matrixBoard[i][columnMove] = player;
			return board;
		}
	}
	return false;
}


CanvasBoard.prototype.enableClick = function(){
	var board = this;
	board.isClickDisabled = false;
}

CanvasBoard.prototype.disableClick = function(){
	this.isClickDisabled = true;
}

CanvasBoard.prototype.isFull = function(){
	var board = this;
	for(var column=0; column<Config.COLUMNS_SIZE; column++){
        var atLeastOneEmpty = false;
		if(board.matrixBoard[0][column] == 0){
			atLeastOneEmpty = true;
			break;
		}
    };
	return !atLeastOneEmpty;
}

CanvasBoard.prototype.getScore = function(){
    var board = this;

	var score = 0;

	function updateScore(HumanInRow, ComputerInRow){
		var points = 0;
		switch(HumanInRow){
			case 4:
				points += Config.WINNING_SCORE;
				break;
			case 3:
				points += 5;
				break;
			case 2:
				points += 1;
				break;
			default:
				break
		}
		switch(ComputerInRow){
			case 4:
				points -= Config.WINNING_SCORE;
				break;
			case 3:
				points -= 5;
				break;
			case 2:
				points -= 1;
				break;
			default:
				break
		}
		return points;
	}

    //Check ROWS
    for (var row=0; row < Config.ROWS_SIZE; row++){
		for (var column=0; column <= Config.COLUMNS_SIZE - 4; column++){
			var HumanInRow = 0, ComputerInRow = 0;
			for (var offset = column; offset < column+4; offset++){
				if(board.matrixBoard[row][offset] == 1) {
					HumanInRow++ ;
					ComputerInRow = 0
				} else if(board.matrixBoard[row][offset] == 2){
					ComputerInRow++ ;
					HumanInRow = 0
				}
			}
			score += updateScore(HumanInRow, ComputerInRow);
			if(score <= -Config.WINNING_SCORE || score >= Config.WINNING_SCORE) return score;
		}
	}

	//Check COLUMNS
    for (var column=0; column < Config.COLUMNS_SIZE; column++){
		for (var row=0; row <= Config.ROWS_SIZE - 4; row++){
			var HumanInRow = 0, ComputerInRow = 0;
			for (var offset=row; offset < row+4; offset++){
				if(board.matrixBoard[offset][column] == 1) {
					HumanInRow++ ;
					ComputerInRow = 0
				} else if(board.matrixBoard[offset][column] == 2){
					ComputerInRow++ ;
					HumanInRow = 0
				}
			}
			score += updateScore(HumanInRow, ComputerInRow);
			if(score <= -Config.WINNING_SCORE || score >= Config.WINNING_SCORE) return score;
		}
	}

	//Check DIAGONALS
	for (var column=0; column <= Config.COLUMNS_SIZE - 4; column++){
		for (var row=0; row <= Config.ROWS_SIZE - 4; row++){
			var HumanInRow = 0, ComputerInRow = 0;
			for (var offset=row; offset < row+4; offset++){
				if(board.matrixBoard[offset][(offset-row) + column] == 1) {
					HumanInRow++ ;
					ComputerInRow = 0
				} else if(board.matrixBoard[offset][(offset-row) + column] == 2){
					ComputerInRow++ ;
					HumanInRow = 0
				}
			}
			score += updateScore(HumanInRow, ComputerInRow);
			if(score <= -Config.WINNING_SCORE || score >= Config.WINNING_SCORE) return score;
		}
	}
	for (var column=Config.COLUMNS_SIZE -1; column >= Config.COLUMNS_SIZE - 4; column--){
		for (var row=0; row <= Config.ROWS_SIZE - 4; row++){
			var HumanInRow = 0, ComputerInRow = 0;
			for (var offset=row; offset < row+4; offset++){
				if(board.matrixBoard[offset][column - (offset-row)] == 1) {
					HumanInRow++ ;
					ComputerInRow = 0
				} else if(board.matrixBoard[offset][column - (offset-row)] == 2){
					ComputerInRow++ ;
					HumanInRow = 0
				}
			}
			score += updateScore(HumanInRow, ComputerInRow);
			if(score <= -Config.WINNING_SCORE || score >= Config.WINNING_SCORE) return score;
		}
	}

	return score;
}





