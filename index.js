/* -----------------------------------------------------------------------------------
   Developed by the Applications Prototype Lab
   (c) 2015 Esri | http://www.esri.com/legal/software-license  
----------------------------------------------------------------------------------- */

require([
    'esri/Map',
    'esri/Camera',
    'esri/layers/ArcGISTiledLayer',
    'esri/core/Scheduler',
    'esri/views/SceneView',
    'dojo/domReady!'
],
function (
    Map,
    Camera,
    ArcGISTiledLayer,
    Scheduler,
    SceneView
    ) {
    $(document).ready(function () {
        // Enforce strict mode
        'use strict';

        var BASEMAP = 'http://services.arcgisonline.com/arcgis/rest/services/world_imagery/mapserver';

        var MAGNITUDE_MIN = 6;                          // Chart's smallest earthquake magnitude
        var MAGNITUDE_MAX = 10;                         // Chart's largest earthquake magnitude
        var DATE_MIN = new Date(1900, 1, 1);            // Chart's start date
        var DATE_MAX = new Date(2020, 1, 1);            // Chart's end date
        var DATE_START = new Date(1960, 1, 1);          // The chart's initial date

        var QUAKE_RADIUS = 500000;                      // Pulse radius
        var QUAKE_PULSE_LENGTH = 2000;                  // Pulse time
        var QUAKE_SCALE = 5;                            // Size and time magnifier for the largest quake
        var QUAKE_MAX_DELAY = 500;                      // Maximum time to delay pulse

        var EARTH_RADIUS = 6380000;                     // Radius used to display pulses
        var PULSE_VERTEX_COUNT = 20;                    // Circle densification
        var TICKS_PER_YEAR = 1000 * 60 * 60 * 24 * 365; // The number of milliseconds in one year
        var SELECTION = TICKS_PER_YEAR / 2;             // Quake selection width (milliseconds) on the chart

        var USGS_EVENT_PAGE = 'http://earthquake.usgs.gov/earthquakes/eventpage/{0}';

        var DEADLIEST = [
            {
                id: 'iscgem912687',
                name: '1920 Haiyuan earthquake',
                url: 'https://en.wikipedia.org/wiki/1920_Haiyuan_earthquake',
                fatalities: 273400
            },
            {
                id: 'usp0000hk6',
                name: '1976 Tangshan earthquake',
                url: 'https://en.wikipedia.org/wiki/1976_Tangshan_earthquake',
                fatalities: 242769
            },
            {
                id: 'usp000dbed',
                name: '2004 Indian Ocean earthquake',
                url: 'https://en.wikipedia.org/wiki/2004_Indian_Ocean_earthquake_and_tsunami',
                fatalities: 230210
            },
            {
                id: 'iscgem16958009',
                name: '1908 Messina earthquake',
                url: 'https://en.wikipedia.org/wiki/1908_Messina_earthquake',
                fatalities: 123000
            },
            {
                id: 'iscgem897583',
                name: '1948 Ashgabat earthquake',
                url: 'https://en.wikipedia.org/wiki/1948_Ashgabat_earthquake',
                fatalities: 110000
            },
            {
                id: 'iscgem911526',
                name: '1923 Great Kantō earthquake',
                url: 'https://en.wikipedia.org/wiki/1923_Great_Kant%C5%8D_earthquake',
                fatalities: 105385
            },
            {
                id: 'usp000h60h',
                name: '2010 Haiti earthquake',
                url: 'https://en.wikipedia.org/wiki/2010_Haiti_earthquake',
                fatalities: 100000
            },
            {
                id: 'usp000e12e',
                name: '2005 Kashmir earthquake',
                url: 'https://en.wikipedia.org/wiki/2005_Kashmir_earthquake',
                fatalities: 86000
            }
        ];
        var LARGEST = [
            {
                id: 'iscgem879136',
                name: 'Validvia Earthquake',
                url: 'https://en.wikipedia.org/wiki/1960_Valdivia_earthquake'
            },
            {
                id: 'iscgem869809',
                name: '1964 Alaska earthquake',
                url: 'https://en.wikipedia.org/wiki/1964_Alaska_earthquake'
            },
            {
                id: 'usp000dbed',
                name: '2004 Indian Ocean earthquake',
                url: 'https://en.wikipedia.org/wiki/2004_Indian_Ocean_earthquake_and_tsunami'
            },
            {
                id: 'usp000hvnu',
                name: '2011 Tōhoku earthquake',
                url: 'https://en.wikipedia.org/wiki/2011_T%C5%8Dhoku_earthquake_and_tsunami'
            },
            {
                id: 'iscgem893648',
                name: '1952 Kamchatka earthquakes',
                url: 'https://en.wikipedia.org/wiki/Kamchatka_earthquakes#1952_earthquake'
            },
            {
                id: 'iscgemsup16957884',
                name: '1906 Ecuador–Colombia earthquake',
                url: 'https://en.wikipedia.org/wiki/1906_Ecuador%E2%80%93Colombia_earthquake'
            },
            {
                id: 'usp000h7rf',
                name: '2010 Chile earthquake',
                url: 'https://en.wikipedia.org/wiki/2010_Chile_earthquake'
            },
            {
                id: 'iscgem895681',
                name: '1950 Assam–Tibet earthquake',
                url: 'https://en.wikipedia.org/wiki/1950_Assam%E2%80%93Tibet_earthquake'
            },
            {
                id: 'iscgem859206',
                name: '1965 Rat Islands earthquake',
                url: 'https://en.wikipedia.org/wiki/1965_Rat_Islands_earthquake'
            },
            {
                id: 'iscgem886030',
                name: '1957 Andreanof Islands earthquake',
                url: 'https://en.wikipedia.org/wiki/1957_Andreanof_Islands_earthquake'
            },
            {
                id: 'usp000dk85',
                name: '2005 Sumatra earthquake',
                url: 'https://en.wikipedia.org/wiki/2005_Sumatra_earthquake'
            },
            {
                id: 'usp000jhh2',
                name: '2012 Aceh earthquake',
                url: 'https://en.wikipedia.org/wiki/2012_Aceh_earthquake'
            },
            {
                id: 'iscgem912062',
                name: '1922 Vallenar earthquake',
                url: 'https://en.wikipedia.org/wiki/1922_Vallenar_earthquake'
            },
            {
                id: 'iscgem902352',
                name: '1938 Banda Sea earthquake',
                url: 'https://en.wikipedia.org/wiki/1938_Banda_Sea_earthquake'
            },
            {
                id: 'iscgem873239',
                name: '1963 Kuril Islands earthquake',
                url: 'https://en.wikipedia.org/wiki/1963_Kuril_Islands_earthquake'
            },
            {
                id: 'usp000fmz4',
                name: '2007 Sumatra earthquakes',
                url: 'https://en.wikipedia.org/wiki/September_2007_Sumatra_earthquakes'
            }
        ];

        var _gl = null;
        var _camera = null;
        var _shader = null;
        var _positionBuffer = null;
        var _colorBuffer = null;
        var _sizeBuffer = null;
        var _isdragging = false;
        var _currentTime = DATE_START;
        var _pauseAnimation = true;

        // Show welcome screen
        $('#welcome').fadeIn();

        // Create map and view
        var _view = new SceneView({
            container: 'map',
            map: new Map({
                layers: [
                    new ArcGISTiledLayer({
                        url: BASEMAP
                    })
                ]
            }),
            ui: {
                components: []
            }
        });

        _view.then(function () {
            // Get webgl context and create shader
            _gl = _view.canvas.getContext('experimental-webgl');

            // Get a reference to the Esri camera
            _camera = _view._stage.getCamera();

            // Disable idle frame refreshes
            _view._stage.setRenderParams({
                idleSuspend: false
            });

            // Load quakes
            loadQuakes().done(function (q) {
                // Load chart
                loadChart(q);

                // Load panel
                loadPanel();

                // Load shaders
                loadShaders();

                // Re-generate chart when the window resizes
                var width = $('#chart').width();
                $(window).debounce('resize', function () {
                    // Exit if width is unchanged
                    var w = $('#chart').width();
                    if (width === w) { return; }
                    width = w;

                    // Clear chart
                    $('#chart').empty();

                    // Re-load chart
                    loadChart(q);
                }, 250);
            });

            // Add altitude constraint to prevent zoom in/out
            _view.constraints = {
                altitude: {
                    min: _view.camera.position.z,
                    max: _view.camera.position.z
                }
            };
        });

        function loadQuakes() {
            var defer = new $.Deferred();
            var quakes = [];
            $.get('data/query6.txt', function (data) {
                var lines = data.replace(new RegExp('\r', 'gm'), '').split('\n');
                $.each(lines, function (i) {
                    //    0,        1,         2,     3,   4,       5,   6,   7,    8,   9,  10, 11,    12,   13
                    // time, latitude, longitude, depth, mag, magType, nst, gap, dmin, rms, net, id, place, type
                    if (i === 0) { return true; }
                    if (this === '') { return true; }
                    var pieces = this.split(',');

                    //
                    quakes.push({
                        time: new Date(pieces[0]),
                        latitude: Number(pieces[1]),
                        longitude: Number(pieces[2]),
                        depth: Number(pieces[3]),
                        mag: Number(pieces[4]),
                        //magType: pieces[5],
                        //nst: pieces[6],
                        //gap: Number(pieces[7]),
                        //dmin: Number(pieces[8]),
                        //rms: Number(pieces[9]),
                        //net: Number(pieces[10]),
                        id: pieces[11],
                        description: pieces[12].replace(/;/g, ','),
                        type: pieces[13]
                    });
                });
                defer.resolve(quakes);
            });
            return defer.promise();
        }

        function loadShaders() {
            // Compile fragment and vertex shaders
            var v = 'uniform mat4 uPMatrix;' +
                    'uniform mat4 uVMatrix;' +
                    'attribute vec3 aPosition;' +
                    'attribute vec4 aColor;' +
                    'attribute float aSize;' +
                    'varying vec4 vColor;' +
                    'void main(void) {' +
                        'gl_Position = uPMatrix * uVMatrix * vec4(aPosition, 1.0);' +
                        'gl_PointSize = aSize;' +
                        'vColor = aColor;' +
                    '}';
            var f = 'precision mediump float;' +
                    'varying vec4 vColor;' +
                    'void main(void) {' +
                        'gl_FragColor = vColor;' +
                    '}';
            var vshader = _gl.createShader(_gl.VERTEX_SHADER);
            var fshader = _gl.createShader(_gl.FRAGMENT_SHADER);
            _gl.shaderSource(vshader, v);
            _gl.shaderSource(fshader, f);
            _gl.compileShader(vshader);
            _gl.compileShader(fshader);

            // Create and assign shader
            _shader = _gl.createProgram();
            _gl.attachShader(_shader, vshader);
            _gl.attachShader(_shader, fshader);

            _gl.linkProgram(_shader);
            if (!_gl.getProgramParameter(_shader, _gl.LINK_STATUS)) {
                alert('Could not initialise shaders');
            }
            _gl.useProgram(_shader);

            // Define variables in the vertex shader
            _shader.pMatrixUniform = _gl.getUniformLocation(_shader, 'uPMatrix');
            _shader.vMatrixUniform = _gl.getUniformLocation(_shader, 'uVMatrix');

            // 
            _shader.position = _gl.getAttribLocation(_shader, 'aPosition');
            _gl.enableVertexAttribArray(_shader.position);

            //
            _shader.color = _gl.getAttribLocation(_shader, 'aColor');
            _gl.enableVertexAttribArray(_shader.color);

            //
            _shader.size = _gl.getAttribLocation(_shader, 'aSize');
            _gl.enableVertexAttribArray(_shader.size);

            _positionBuffer = _gl.createBuffer();
            _colorBuffer = _gl.createBuffer();
            _sizeBuffer = _gl.createBuffer();
        }

        function loadChart(quakes) {
            var margin = {
                left: 80,
                top: 20,
                right: 50,
                bottom: 35
            };
            var width = $('#chart').width();
            var height = $('#chart').height();

            var svg = d3.select('#chart')
                .append('svg')
                .attr('width', width)
                .attr('height', height);

            var x = d3.time.scale()
                .domain([DATE_MIN, DATE_MAX])
                .range([0, width - margin.left - margin.right]);

            var y = d3.scale.linear()
                .domain([MAGNITUDE_MIN, MAGNITUDE_MAX])
                .range([height - margin.top - margin.bottom, 0]);

            var xaxis = d3.svg.axis()
                .scale(x)
                .orient('bottom');

            var yaxis = d3.svg.axis()
                .scale(y)
                .orient('left')
                .tickValues([6, 7, 8, 9, 10]);

            svg.append('g')
                .attr('id', 'yaxis')
                .append('text')
                    .attr('transform', $.format('translate({0},{1}) rotate({2})', [30, 120, -90]))
                    .text('Magnitude');

            svg.append('g')
                .attr('transform', $.format('translate({0},{1})', [margin.left, height - margin.bottom]))
                .call(xaxis);

            svg.append('g')
                .attr('transform', $.format('translate({0},{1})', [margin.left, margin.top]))
                .call(yaxis);

            var pointer = svg.append('g')
                .attr('transform', $.format('translate({0},{1})', [margin.left, margin.top]))
                .append('g')
                    .attr('id', 'timeline')
                    .attr('transform', $.format('translate({0},{1})', [x(_currentTime), 0]))
                    .call(d3.behavior.drag()
                        .on('dragstart', function () {
                            // Suppress drag events
                            d3.event.sourceEvent.stopPropagation();
                            d3.event.sourceEvent.preventDefault();

                            // Disable dot events
                            d3.select('#dots').style({
                                'pointer-events': 'none'
                            });

                            // Set dragging flag
                            _isdragging = true;
                        })
                        .on('drag', function () {
                            // Get mouse location. Exit if mouse beyond chart bounds.
                            var mouse = d3.mouse(this.parentNode)[0];
                            if (mouse < 0 || mouse > width) { return; }

                            // Update current time
                            _currentTime = x.invert(mouse);

                            // Select quakes
                            selectQuakes();
                        })
                        .on('dragend', function () {
                            // Restore event listening for all dots
                            d3.select('#dots').style({
                                'pointer-events': 'all'
                            });

                            // Populate list of quakes
                            loadPanel();

                            // Update dragging flag
                            _isdragging = false;
                        })
                    );

            pointer.append('line')
                .attr('x1', 0)
                .attr('x2', 0)
                .attr('y1', y(MAGNITUDE_MIN))
                .attr('y2', y(MAGNITUDE_MAX));

            pointer.append('polygon')
                .attr('points', $.format('{0},{1} {2},{3} {4},{5}', [
                    -5, y(MAGNITUDE_MAX),
                    -15, y(MAGNITUDE_MAX) + 5,
                    -5, y(MAGNITUDE_MAX) + 10
                ]));

            pointer.append('polygon')
                .attr('points', $.format('{0},{1} {2},{3} {4},{5}', [
                    5, y(MAGNITUDE_MAX),
                    15, y(MAGNITUDE_MAX) + 5,
                    5, y(MAGNITUDE_MAX) + 10
                ]));

            svg.append('g')
                .attr('id', 'dots')
                .attr('transform', $.format('translate({0},{1})', [margin.left, margin.top]))
                .style({
                    'pointer-events': 'all'
                })
                .selectAll('circle')
                .data(quakes)
                .enter()
                .append('circle')
                    .attr('cx', function (d) {
                        return x(d.time);
                    })
                    .attr('cy', function (d) {
                        return y(d.mag);
                    })
                    .attr('r', 3)
                    .on('mouseenter', function (d) {
                        if (_isdragging) { return; }
                        d3.select(this)
                            .classed('selected', true)
                            .transition()
                            .duration(300)
                            .ease('exp-out')
                            .attr('r', 5);

                        // Highlight entry in the list
                        $('#quakes > div')
                            .filter(function () {
                                return $(this).data('quake').id === d.id;
                            })
                            .addClass('selected')
                            .scrollToView();
                    })
                    .on('mouseleave', function (d) {
                        d3.select(this)
                            .classed('selected', false)
                            .transition()
                            .duration(0)
                            .ease('exp-out')
                            .attr('r', 3);

                        // Remove highlighting (if any) from the list
                        $('#quakes > div').removeClass('selected');
                    })
                    .on('click', function (d) {
                        _currentTime = d.time;
                        _view.animateTo({
                            target: [d.longitude, d.latitude],
                            heading: 0
                        }, {
                            delay: 0,
                            duration: 10000
                        });
                        selectQuakes();

                        // Populate list of quakes
                        loadPanel();
                    });

            // Select quakes
            selectQuakes();

            function selectQuakes() {
                // Move red timeline into position
                d3.select('#timeline').attr('transform', $.format('translate({0},{1})', [
                    x(_currentTime),
                    0
                ]));

                // Highlight all quakes within a few pixels of the timeline
                var now = Date.now();
                d3.selectAll('#dots circle').classed('current', function (q) {
                    var cx = d3.select(this).attr('cx');
                    var dt = x.invert(cx);
                    var tk = dt - _currentTime;
                    if (Math.abs(tk) > SELECTION) {
                        return false;
                    }
                    q.ticks = now + Math.random() * QUAKE_MAX_DELAY;
                    return true;
                });
            }
        }

        function loadPanel() {
            // Remove existing quakes
            $('#quakes').empty().scrollTop();

            // Order highlighted quakes by magnitude and then add entry to panel.
            d3.selectAll('#dots circle.current:not(.hidden)')
                .sort(function (a, b) {
                    return b.mag - a.mag;
                })
                .each(function (d) {
                    var that = this;

                    var deaths = '-';
                    var url = null;
                    var image = null;

                    $.each(DEADLIEST, function () {
                        if (this.id === d.id) {
                            deaths = d3.format(',g')(this.fatalities);
                            url = this.url;
                            return false;
                        }
                    });
                    if (url === null) {
                        $.each(LARGEST, function () {
                            if (this.id === d.id) {
                                url = this.url;
                                return false;
                            }
                        });
                    }
                    switch (d.type) {
                        case 'nuclear explosion':
                            image = 'img/nuke.png';
                            break;
                        case 'explosion':
                        case 'rock burst':
                            image = 'img/explosion.png';
                            break;
                        case 'earthquake':
                        default:
                            image = 'img/quake.png';
                            break;
                    }
                    
                    $('#quakes').append(
                        $(document.createElement('div')).addClass('panel-quake').append(
                            $(document.createElement('table')).append(
                                $(document.createElement('tr')).append(
                                    $(document.createElement('td')).css({ 'font-size': '20px' }).attr('colspan', '3').html(d.description)
                                ),
                                $(document.createElement('tr')).append(
                                    $(document.createElement('td')).css({ 'width': '15%' }).attr('rowspan', '4').append(
                                        $(document.createElement('div')).css({ 'font-size': '20px' }).html(d3.format('.1f')(d.mag)),
                                        $(document.createElement('img')).attr({
                                            src: image,
                                            height: '30px'
                                        })
                                    ),
                                    $(document.createElement('td')).css({ 'width': '25%', 'font-size': '12px', 'font-weight': '700' }).html('Time'),
                                    $(document.createElement('td')).css({ 'width': '60%', 'font-size': '12px' }).html(d.time.toLocaleString())
                                ),
                                $(document.createElement('tr')).append(
                                    $(document.createElement('td')).css({ 'width': '25%', 'font-size': '12px', 'font-weight': '700' }).html('Depth'),
                                    $(document.createElement('td')).css({ 'width': '60%', 'font-size': '12px' }).html($.format('{0}km',[d.depth]))
                                ),
                                $(document.createElement('tr')).append(
                                    $(document.createElement('td')).css({ 'width': '25%', 'font-size': '12px', 'font-weight': '700' }).html('Deaths'),
                                    $(document.createElement('td')).css({ 'width': '60%', 'font-size': '12px' }).html(deaths)
                                ),
                                $(document.createElement('tr')).append(
                                    $(document.createElement('td')).css({ 'width': '25%', 'font-size': '12px', 'font-weight': '700' }).html('Links'),
                                    $(document.createElement('td')).css({ 'width': '60%', 'font-size': '12px', 'pointer-events': 'all' }).append(
                                        function () {
                                            var links = [];
                                            links.push(
                                                $(document.createElement('a')).attr({
                                                    href: $.format(USGS_EVENT_PAGE, [d.id]),
                                                    target: '_blank'
                                                }).html('usgs')
                                            );
                                            if (url !== null) {
                                                links.push(
                                                    $(document.createElement('a')).attr({
                                                        href: url,
                                                        target: '_blank'
                                                    }).css({'margin-left': '10px'}).html('wiki')
                                                );
                                            }
                                            return links;
                                        }
                                    )
                                )
                            )
                        )
                        .mouseenter(function () {
                            d3.select(that)
                                .classed('selected', true)
                                .moveToFront()
                                .transition()
                                .duration(300)
                                .ease('exp-out')
                                .attr('r', 5);
                        })
                        .mouseleave(function () {
                            d3.select(that)
                                .classed('selected', false)
                                .transition()
                                .duration(0)
                                .ease('exp-out')
                                .attr('r', 3);
                        })
                        .data('quake', d)
                        .click(function () {
                            _view.animateTo({
                                target: [d.longitude, d.latitude],
                                heading: 0
                            });
                        })
                    );
                });
        }

        function render(type, positions, colors, sizes) {
            _gl.bindBuffer(_gl.ARRAY_BUFFER, _positionBuffer);
            _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(positions), _gl.STATIC_DRAW);
            _gl.vertexAttribPointer(_shader.position, 3, _gl.FLOAT, false, 0, 0);

            _gl.bindBuffer(_gl.ARRAY_BUFFER, _colorBuffer);
            _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(colors), _gl.STATIC_DRAW);
            _gl.vertexAttribPointer(_shader.color, 4, _gl.FLOAT, false, 0, 0);

            _gl.bindBuffer(_gl.ARRAY_BUFFER, _sizeBuffer);
            _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(sizes), _gl.STATIC_DRAW);
            _gl.vertexAttribPointer(_shader.size, 1, _gl.FLOAT, false, 0, 0);

            _gl.drawArrays(type, 0, sizes.length);
        }

        // Draw loop
        Scheduler.addFrameTask({
            postRender: function (time, deltaTime, timeFromBeginning, spendInFrame) {
                if (_gl === null) { return; }
                if (_shader === null) { return; }

                // Reassign shader program
                _gl.useProgram(_shader);

                // Enable alpha blending
                _gl.enable(_gl.BLEND);

                // Assign uniform matrices
                _gl.uniformMatrix4fv(_shader.pMatrixUniform, false, _camera.projectionMatrix);
                _gl.uniformMatrix4fv(_shader.vMatrixUniform, false, _camera.viewMatrix);

                _gl.enableVertexAttribArray(_shader.position);
                _gl.enableVertexAttribArray(_shader.color);
                _gl.enableVertexAttribArray(_shader.size);

                // If the help or about windows are open, pause animation
                if (_pauseAnimation) {
                    render(_gl.POINTS, [0, 0, 0], [1, 0, 0, 1], [1]);
                    return;
                }

                // Fix - If no quakes selected then add a red dot in the center of the globe
                var quakes = d3.selectAll('#dots circle.current:not(.hidden)');
                if (quakes.size() === 0) {
                    render(_gl.POINTS, [0, 0, 0], [1, 0, 0, 1], [1]);
                    return;
                }

                // If dragging represent "current" quakes with a simple dot
                if (_isdragging) {
                    var position = [];
                    var color = [];
                    var size = [];

                    quakes.each(function (d) {
                        var lon = d.longitude * Math.PI / 180;
                        var lat = d.latitude * Math.PI / 180;
                        var quk = $V([EARTH_RADIUS, 0, 0])
                            .rotate(lat, $L([0, 0, 0], [0, 0, 1]))
                            .rotate(lon, $L([0, 0, 0], [0, 1, 0]));
                        position.push(quk.e(1), quk.e(2), quk.e(3));
                        color.push(1, 0, 0, 1);
                        size.push(3);
                    });

                    render(_gl.POINTS, position, color, size);
                    return;
                }

                d3.select('#dots circle.selected').each(function (d) {
                    var lon = d.longitude * Math.PI / 180;
                    var lat = d.latitude * Math.PI / 180;
                    var quk = $V([EARTH_RADIUS, 0, 0])
                        .rotate(lat, $L([0, 0, 0], [0, 0, 1]))
                        .rotate(lon, $L([0, 0, 0], [0, 1, 0]));
                    render(
                        _gl.POINTS,
                        [quk.e(1), quk.e(2), quk.e(3)],
                        [0, 1, 1, 1],
                        [3]
                    );
                });

                // Get the current time
                var now = Date.now();

                // Draw a pulsating ring for each quake
                quakes.each(function (d) {
                    // Exit if pulse not ready to show
                    if (now < d.ticks) { return true; }

                    var position = [];
                    var color = [];
                    var size = [];

                    var lon = d.longitude * Math.PI / 180;
                    var lat = d.latitude * Math.PI / 180;

                    var rat = 1 + (QUAKE_SCALE - 1) * (d.mag - MAGNITUDE_MIN) / (MAGNITUDE_MAX - MAGNITUDE_MIN);
                    var per = rat * QUAKE_PULSE_LENGTH;
                    var rem = (now - d.ticks) % per;
                    var rad = QUAKE_RADIUS * rat * rem / per;
                    var alf = (1 - rem / per);

                    for (var j = 0; j <= PULSE_VERTEX_COUNT; j++) {
                        var ang = 2 * j * Math.PI / PULSE_VERTEX_COUNT;
                        var quk = $V([EARTH_RADIUS, 0, 0])
                            .add(
                                $V([0, rad, 0]).rotate(ang, $L([0, 0, 0], [1, 0, 0]))
                            )
                            .rotate(lat, $L([0, 0, 0], [0, 0, 1]))
                            .rotate(lon, $L([0, 0, 0], [0, 1, 0]));
                        position.push(quk.e(1), quk.e(2), quk.e(3));
                        if (d3.select(this).classed('selected')) {
                            color.push(0, 1, 1, alf);
                        }
                        else {
                            color.push(1, 0, 0, alf);
                        }
                        size.push(1);
                    }

                    render(_gl.LINE_LOOP, position, color, size);
                });
            }
        });

        $('#filters .button').click(function () {
            // Exit if already selected
            if ($(this).hasClass('selected')) { return; }

            // Toggle button selected status
            $(this).addClass('selected').siblings().removeClass('selected');

            // Show/hide quakes
            switch ($(this).attr('data-action')) {
                case 'all':
                    d3.selectAll('#dots circle').classed('hidden', false);
                    break;
                case 'quake':
                    d3.selectAll('#dots circle').classed('hidden', function (d) {
                        return d.type !== 'earthquake';
                    });
                    break;
                case 'nuke':
                    d3.selectAll('#dots circle').classed('hidden', function (d) {
                        return d.type !== 'nuclear explosion';
                    });
                    break;
                case 'deadliest':
                    var ids1 = $.map(DEADLIEST, function (e) {
                        return e.id;
                    });
                    d3.selectAll('#dots circle').classed('hidden', function (d) {
                        return $.inArray(d.id, ids1) === -1;
                    });
                    break;
                case 'largest':
                    var ids2 = $.map(LARGEST, function (e) {
                        return e.id;
                    });
                    d3.selectAll('#dots circle').classed('hidden', function (d) {
                        return $.inArray(d.id, ids2) === -1;
                    });
                    break;
            }

            // Populate list of quakes
            loadPanel();
        });

        $('#help .button').click(function () {
            switch ($(this).attr('data-action')) {
                case 'how':
                    $('#tutorial-1').fadeIn();
                    _pauseAnimation = true;
                    break;
                case 'about':
                    $('#about').fadeIn();
                    _pauseAnimation = true;
                    break;
            }
        });

        $('#about .button').click(function () {
            switch ($(this).attr('data-action')) {
                case 'close':
                    _pauseAnimation = false;
                    $('#about').fadeOut();
                    break;
            }
        });

        $('#welcome .button').click(function () {
            switch ($(this).attr('data-action')) {
                case 'tutorial':
                    $('#welcome').fadeOut();
                    $('#tutorial-1').fadeIn();
                    break;
                case 'close':
                    _pauseAnimation = false;
                    $('#welcome').fadeOut();
                    break;
            }
        });

        $('#tutorial-1 .button').click(function () {
            switch ($(this).attr('data-action')) {
                case 'next':
                    $('#tutorial-1').fadeOut();
                    $('#tutorial-2').fadeIn();
                    break;
                case 'finish':
                    _pauseAnimation = false;
                    $('#tutorial-1').fadeOut();
                    break;
            }
        });

        $('#tutorial-2 .button').click(function () {
            switch ($(this).attr('data-action')) {
                case 'next':
                    $('#tutorial-2').fadeOut();
                    $('#tutorial-3').fadeIn();
                    break;
                case 'finish':
                    _pauseAnimation = false;
                    $('#tutorial-2').fadeOut();
                    break;
            }
        });

        $('#tutorial-3 .button').click(function () {
            switch ($(this).attr('data-action')) {
                case 'finish':
                    _pauseAnimation = false;
                    $('#tutorial-3').fadeOut();
                    break;
            }
        });

        $('a').attr('target', '_blank');

        $.fn.scrollToView = function () {
            return $.each(this, function () {
                if ($(this).position().top < 0 ||
                    $(this).position().top + $(this).height() > $(this).parent().height()) {
                    $(this).parent().animate({
                        scrollTop: $(this).parent().scrollTop() + $(this).position().top
                    }, {
                        duration: 300,
                        queue: false
                    });
                }
            });
        };
        $.fn.debounce = function (on, func, threshold) {
            var debounce = function (func, threshold, execAsap) {
                var timeout;
                return function debounced() {
                    var obj = this;
                    var args = arguments;
                    function delayed() {
                        if (!execAsap) {
                            func.apply(obj, args);
                        }
                        timeout = null;
                    }
                    if (timeout) {
                        clearTimeout(timeout);
                    }
                    else if (execAsap) {
                        func.apply(obj, args);
                    }
                    timeout = setTimeout(delayed, threshold || 100);
                };
            };
            $(this).on(on, debounce(func, threshold));
        };
        $.fn.bringToFont = function (selector) {
            var max = Math.max.apply(null, $(this).siblings(selector).map(function () {
                return $(this).zIndex();
            }));
            $(this).zIndex(++max);
            return this;
        };
        $.format = function (f, e) {
            $.each(e, function (i) {
                f = f.replace(new RegExp('\\{' + i + '\\}', 'gm'), this);
            });
            return f;
        };

        d3.selection.prototype.moveToFront = function () {
            return this.each(function () {
                this.parentNode.appendChild(this);
            });
        };
    });
});