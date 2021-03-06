var picking = false;
var start = [0,0];
var startblock = null;
var number = 0;
var previous = null;
var links = [];

function destroy_puzzle() {
    picking = false;
    start = [0,0];
    startblock = null;
    number = 0
    previous = null;
    links = []
    $(".linkapix").html("");
}

function json_to_puzzle(json_url) {
    console.log('build!' + json_url);
    $.getJSON(json_url, function(data) {
        //console.log(data);
        build_puzzle(data);
    });
};

function string_to_puzzle(json) {
    var data = JSON.parse(json);
    return data;
};

function build_puzzle(puzzle) {
    var table = $("<table></table>");
    $(".linkapix").append(table);
    $(".linkapix").append();
    $.each(puzzle, function(rid, row) {
        var tr = $("<tr/>")
        var blocks = [];
        $.each(row, function(cid, block) {
            if(block !== null) {
                if(block.number != 0) {
                    number = block.number;
                } else {
                    number = '';
                }
            } else {
                number = '';
            }
            if(number != '') {
                blocks.push('<td class="static" data-number="'+number+'" data-x="'+cid+'" data-y="'+rid+'">' + number + "</td>");
            } else {
                blocks.push('<td data-number="'+number+'" data-x="'+cid+'" data-y="'+rid+'">' + number + "</td>");
            }

            //number = block !== null ? block.number : "";
            //console.log('x');
            //blocks.push('<td data-number="'+number+'" data-x="'+cid+'" data-y="'+rid+'">' + number + "</td>");
        });
        tr.append(blocks);
        table.append(tr)
    });
    //state = new State();
    register_game_events();

};

$("#launch_test").click(function() {
    destroy_puzzle();
    json_to_puzzle('puzzles/5x5test.json');
    //build_puzzle(puzzle);
});

$("#launch_gentest").click(function() {
    destroy_puzzle();
    json_to_puzzle('puzzles/gentest_gen.json');
});

function refresh_game() {
    $("td").each(function(index) {
        if ($(this).data('number') != 0) {
            $(this).html($(this).data('number'));
        } else {
            $(this).html($(this).data('partial'));
        }
    })
}

function register_game_events() {
    $("td").mousedown(function() {
        if ($(this).hasClass('link-end')) {
            $(".linkapix").trigger('editlink', [$(this)]);
            return
        }
        if($(this).hasClass('linked')) {
            $(".linkapix").trigger('editlink', [$(this)]);
            return
        }
        if($(this).hasClass('unfinished')) {
            return;
        } else {
            $(".linkapix").trigger('startlink', [$(this), $(this).data('x'), $(this).data('y')]);
        }
    });

    $("td").mouseover(function() {
        if (picking) {
            $(".linkapix").trigger('extendlink', [$(this)]);
        }
    });

    $("td").mouseup(function() {
        if (picking) {
            $('.linkapix').trigger('stoplink', [$(this)]);
        }
    });

    $('.linkapix').on('startlink', function(event, block, x, y) {
        start = [x, y];
        startblock = block;

        if (block.data('number') == '') {
            return;
        }
        else if (block.data('number') == '1') {
            block.addClass('linked');
        }
        else {
            //console.log($(this).html());
            number = block.data('number');
            picking = true;
            block.addClass('picking');
            links.push(block);
        }
    });

    $('.linkapix').on('extendlink', function(event, block) {
        //console.log(block);
        if (previous !== null) previous.html('');
        if (block.hasClass('unfinished') || block.hasClass('linked') || block.hasClass('picking') || $('td.picking').length >= number || (block.hasClass('static') && block.data('number') != number)) {
            picking = false;
            if ([block.data('x'), block.data('y')] != start) {
                //console.log(block.data('x'), block.data('y'));
                //console.log(previous.data('x'), previous.data('y'));
                if(previous == null) {
                    picking = false;
                    $("td.picking").removeClass('picking');
                    links = [];
                    return
                }
                $(this).trigger('stoplink', [previous]);
            }
            $("td.picking").removeClass('picking');
            return;
        } else {
            block.addClass('picking');
            links.push(block);
            block.html($('td.picking').length);
            //console.log(block != startblock);
            //console.log([block.data('x'), block.data('y')] != start)
            if (block != startblock) {
                previous = block;
            }
        }
    });

$('.linkapix').on('stoplink', function(event, block) {
            //console_log($("td.picking").length);
            previous = null;
            if (block.data('number') == '') {
                len = $("td.picking").length;
                block.addClass('unfinished link-end');
                block.html(len);
                block.data('partial', $("td.picking").length);
                links.push(block);
                block.data('links', links);
                links = [];
                $("td.picking").removeClass('picking').addClass('unfinished');
            } else if (block.data('number') == number && $("td.picking").length == number) {
                $("td.picking").removeClass('picking');
                links.push(block);
                block.data('links', links);
                startblock.data('links', links);
                block.addClass('linked');
                $.each(links, function(key, val) {
                    val.addClass('linked');
                });
                links = [];
            }
            $("td.picking").removeClass('picking');
            picking = false;
            refresh_game();
        });

$('.linkapix').on('editlink', function(event, block) {
    block.html('');
    block.removeClass('link-end');
    $.each(block.data('links'), function(key, val) {
        val.data('partial', null);
        val.removeClass('unfinished');
        val.removeClass('linked');
    });
    refresh_game();
});
};

$("#launch_gentest").trigger('click');