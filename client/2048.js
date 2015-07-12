(function Game(){
    var BLOCK_SIZE = 75;
    var NUM_BLOCKS = 4;
    var DIR = { RIGHT: 39, DOWN: 40, LEFT: 37, UP: 38};
    var EMPTY_VALUE = 1;
    var INIT_VALUE = 2;

    var FONT_TYPE = "Bold";
    var FONT_NAME = "Georgia";

    var CONFIG = {
        1: {
            bg: "#ffffff",
            style: "#ffffff",
            font: FONT_TYPE + " 0px " + FONT_NAME,
        },
        2: {
            bg: "#ffffff",
            fg: "#000000",
            font: FONT_TYPE + " 45px " + FONT_NAME,
        },
        4: {
            bg: "#ffffff",
            fg: "#100020",
            font: FONT_TYPE + " 45px " + FONT_NAME,
        },
        8: {
            bg: "#ffffff",
            fg: "#400020",
            font: FONT_TYPE + " 45px " + FONT_NAME,
        },
        16: {
            bg: "#ffffff",
            fg: "#600030",
            font: FONT_TYPE + " 40px " + FONT_NAME,
        },
        32: {
            bg: "#ffffff",
            fg: "#900030",
            font: FONT_TYPE + " 40px " + FONT_NAME,
        },
        64: {
            bg: "#ffffff",
            fg: "#b00060",
            font: FONT_TYPE + " 40px " + FONT_NAME,
        },
        128: {
            bg: "#000000",
            fg: "#b09000",
            font: FONT_TYPE + " 30px " + FONT_NAME,
        },
        256: {
            bg: "#000000",
            fg: "#f00090",
            font: FONT_TYPE + " 30px " + FONT_NAME,
        },
        512: {
            bg: "#000000",
            fg: "#f000b0",
            font: FONT_TYPE + " 30px " + FONT_NAME,
        },
        1024: {
            bg: "#000000",
            fg: "#f0f000",
            font: FONT_TYPE + " 20px " + FONT_NAME,
        },
        2048: {
            bg: "#000000",
            fg: "#30f0f0",
            font: FONT_TYPE + " 20px " + FONT_NAME,
        },
        4096: {
            bg: "#000000",
            fg: "#f0f060",
            font: FONT_TYPE + " 20px " + FONT_NAME,
        },
    };

    function Tile(canvasCtx, row, col, value) {
        this.canvasCtx = canvasCtx;
        this.top = row * BLOCK_SIZE;
        this.left = col * BLOCK_SIZE;
        this.value = value;
    }

    Tile.prototype.draw = function () {
        this.canvasCtx.strokeRect(this.left, this.top, BLOCK_SIZE, BLOCK_SIZE);
        this.canvasCtx.fillStyle = CONFIG[this.value].bg || "#ffffff";
        this.canvasCtx.fill();
        this.canvasCtx.fillStyle = CONFIG[this.value].fg || "#000000";
        this.canvasCtx.font = CONFIG[this.value].font;
        this.canvasCtx.textAlign = "center";
        this.canvasCtx.fillText(
                           "" + (this.value === EMPTY_VALUE ? "" : this.value),
                           this.left + BLOCK_SIZE/2,
                           this.top + BLOCK_SIZE/2);
    };

    Object.defineProperty(Tile, "value", {
        get: function () {
            return this.value;
        },
    });

    function Board(canvasCtx, count) {
        this.canvasCtx = canvasCtx;
        this.count = count;
        this.initializeBoard();
        this.placeTile(0, 0, INIT_VALUE);
        this.placeTile(0, 1, INIT_VALUE);
    }

    Board.prototype.initializeBoard = function () {
        this.positions = [];
        for (var i = 0; i < this.count; ++i) {
            this.positions[i] = [];
            for (var j = 0; j < this.count; ++j) {
                this.positions[i][j] =
                                   new Tile(this.canvasCtx, i, j, EMPTY_VALUE);
            }
        }
    };

    Board.prototype.hasEmptySlot = function () {
        for (var i = 0; i < this.count; ++i) {
            for (var j = 0; j < this.count; ++j) {
                if (this.positions[i][j].value === EMPTY_VALUE) {
                    return true;
                }
            }
        }
        return false;
    };

    Board.prototype.insertRandomNewTile = function () {
        var x = Math.floor(Math.random() * this.count);
        var y = Math.floor(Math.random() * this.count);
        if (this.positions[x][y].value === EMPTY_VALUE) {
            this.placeTile(
                      x, y, (Math.random() > 0.6) ? INIT_VALUE : INIT_VALUE*2);
        }
        else {
            this.insertRandomNewTile();
        }
    };

    Board.prototype.placeTile = function (x, y, value) {
        if (x >= this.count) {
            throw new Error("Invalid 'x' coordinate.");
        }
        if (y >= this.count) {
            throw new Error("Invalid 'y' coordinate.");
        }
        this.positions[x][y] = new Tile(this.canvasCtx, x, y, value);
    };

    Board.prototype.swapTile = function (x1, y1, x2, y2) {
        if (x1 >= this.count || x2 >= this.count) {
            throw new Error("Invalid 'x' coordinate.");
        }
        if (y1 >= this.count || y2 >= this.count) {
            throw new Error("Invalid 'y' coordinate.");
        }
        var temp = this.positions[x1][y1];
        this.placeTile(x1, y1, this.positions[x2][y2].value);
        this.placeTile(x2, y2, temp.value);
    };

    Board.prototype.draw = function () {
        this.canvasCtx.clearRect(
                           0, 0, BLOCK_SIZE*NUM_BLOCKS, BLOCK_SIZE*NUM_BLOCKS);
        this.positions.forEach(function (tileRow) {
            tileRow.forEach(function (tile) {
                tile.draw();
            });
        });
    };

    Board.prototype.slideLeft = function () {
        var changed = false;
        for (var i = 0; i < this.count ; ++i) {
            for (var j = 0; j < this.count -1 ; ++j) {
                var tile = this.positions[i][j];
                if (tile.value === 1) {
                    for (var k = j + 1; k < this.count; ++k) {
                        var iterTile = this.positions[i][k];
                        if (iterTile.value !== 1) {
                            this.swapTile(i, k, i, j);
                            changed = true;
                            break;
                        }
                    }
                }
            }
            for (var j = 0; j < this.count -1 ; ++j) {
                var tile = this.positions[i][j];
                if (tile.value === 1) {
                    break;
                }
                var rightTile = this.positions[i][j + 1];
                if (tile.value === rightTile.value) {
                    this.placeTile(i, j, tile.value * 2);
                    this.placeTile(i, j + 1, EMPTY_VALUE);
                    changed = true;
                    for (var k = j + 1; k < this.count - 1; ++k) {
                        this.swapTile(i, k, i, k + 1);
                    }
                }
            }
        }
        return changed;
    };

    Board.prototype.slideRight = function () {
        var changed = false;
        for (var i = 0; i < this.count ; ++i) {
            for (var j = this.count - 1; j > 0 ; --j) {
                var tile = this.positions[i][j];
                if (tile.value === 1) {
                    for (var k = j - 1; k >= 0; --k) {
                        var iterTile = this.positions[i][k];
                        if (iterTile.value !== 1) {
                            this.swapTile(i, k, i, j);
                            changed = true;
                            break;
                        }
                    }
                }
            }
            for (var j = this.count - 1; j > 0 ; --j) {
                var tile = this.positions[i][j];
                if (tile.value === 1) {
                    break;
                }
                var leftTile = this.positions[i][j - 1];
                if (tile.value === leftTile.value) {
                    this.placeTile(i, j, tile.value * 2);
                    this.placeTile(i, j - 1, EMPTY_VALUE);
                    changed = true;
                    for (var k = j - 1; k > 0; --k) {
                        this.swapTile(i, k, i, k - 1);
                    }
                }
            }
        }
        return changed;
    };

    Board.prototype.slideUp = function () {
        var changed = false;
        for (var i = 0; i < this.count ; ++i) {
            for (var j = 0; j < this.count -1 ; ++j) {
                var tile = this.positions[j][i];
                if (tile.value === 1) {
                    for (var k = j + 1; k < this.count; ++k) {
                        var iterTile = this.positions[k][i];
                        if (iterTile.value !== 1) {
                            this.swapTile(k, i, j, i);
                            changed = true;
                            break;
                        }
                    }
                }
            }
            for (var j = 0; j < this.count -1 ; ++j) {
                var tile = this.positions[j][i];
                if (tile.value === 1) {
                    break;
                }
                var rightTile = this.positions[j + 1][i];
                if (tile.value === rightTile.value) {
                    this.placeTile(j, i, tile.value * 2);
                    this.placeTile(j + 1, i, EMPTY_VALUE);
                    changed = true;
                    for (var k = j + 1; k < this.count - 1; ++k) {
                        this.swapTile(k, i, k + 1, i);
                    }
                }
            }
        }
        return changed;
    };

    Board.prototype.slideDown = function () {
        var changed = false;
        for (var i = 0; i < this.count ; ++i) {
            for (var j = this.count - 1; j > 0 ; --j) {
                var tile = this.positions[j][i];
                if (tile.value === 1) {
                    for (var k = j - 1; k >= 0; --k) {
                        var iterTile = this.positions[k][i];
                        if (iterTile.value !== 1) {
                            this.swapTile(k, i, j, i);
                            changed = true;
                            break;
                        }
                    }
                }
            }
            for (var j = this.count - 1; j > 0 ; --j) {
                var tile = this.positions[j][i];
                if (tile.value === 1) {
                    break;
                }
                var topTile = this.positions[j - 1][i];
                if (tile.value === topTile.value) {
                    this.placeTile(j, i, tile.value * 2);
                    this.placeTile(j - 1, i, EMPTY_VALUE);
                    changed = true;
                    for (var k = j - 1; k > 0; --k) {
                        this.swapTile(k, i, k - 1, i);
                    }
                }
            }
        }
        return changed;
    };

    Board.prototype.iterate = function (dir) {
        var changed = false;
        switch (dir) {
        case DIR.RIGHT: {
            changed = this.slideRight();
        } break;
        case DIR.LEFT: {
            changed = this.slideLeft();
        } break;
        case DIR.DOWN: {
            changed = this.slideDown();
        } break;
        case DIR.UP: {
            changed = this.slideUp();
        } break;
        };
        if (!this.hasEmptySlot()) {
            alert("Game Over! Hit 'F5' to restart.");
        }
        if (changed) {
            this.insertRandomNewTile();
            this.draw();
        }
    };

    this.bindEvents = function () {
        $(document).keydown(function (event) {
            var key = event.which;
            switch (key) {
            case DIR.RIGHT:
            case DIR.DOWN:
            case DIR.LEFT:
            case DIR.UP: {
                this.board.iterate(key);
            } break;
            }
        }.bind(this));
    }.bind(this);

    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) {
                return sParameterName[1];
            }
        }
    }

    this.init = function () {
        var numBlocks = parseInt(getUrlParameter("size"));
        if (numBlocks && !isNaN(numBlocks) && numBlocks > 0) {
            NUM_BLOCKS = numBlocks;
        }
        this.canvas = document.getElementById("appCanvas");
        this.canvas.width = BLOCK_SIZE * NUM_BLOCKS;
        this.canvas.height = BLOCK_SIZE * NUM_BLOCKS;
        this.canvasCtx = this.canvas.getContext("2d");
        this.board = new Board(this.canvasCtx, NUM_BLOCKS);
        this.board.draw();
    };

    $(document).ready(function () {
        this.init();
        this.bindEvents();
    }.bind(this));
})();
