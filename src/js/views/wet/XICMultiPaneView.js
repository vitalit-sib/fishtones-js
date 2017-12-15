/**
 * multiple XIC views in one box. XIC is unique by its mass field
 * the scaling context is either passed (if multiple element are sharing the sameone) or built. ranges will be adapted each time a XIC is added
 *  a XICMultiPaneView is a set of MultiXICView.
 * We can see that as a multlines widget, each line consist of a a series of XIC.
 * scaling context is coherent throughout the different XIC
 *
 * the model of the view if a map of XICCollection
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */
define(['jquery', 'underscore', 'Backbone', 'd3', '../commons/CommonWidgetView', '../utils/D3XAxisView',
        './MultiXICView', 'fishtones/collections/wet/XICCollection', 'fishtones/services/wet/XICClipperFactory'],
    function ($, _, Backbone, d3, CommonWidgetView, D3XAxisView, MultiXICView, XICCollection, xicClipperFactory) {

        XICMultiPaneView = CommonWidgetView.extend({
            //map of MultiXICView
            xicPanes: {},

            /**
             *
             * @param {Object} options for constructor
             * * groupBy : a function taking a provided XIC and computing the key on which we shall groupe the XIC paerp pane
             * * getGroupName [optional]: how to name a group based on the provided XIC. We should assume that all the groupedBy XIC will provide the same name...
             *
             */

            initialize: function (options) {
                var self = this;

                self.mousemoveCallback = options.mousemoveCallback;

                options = _.extend({}, options);
                MultiXICView.__super__.initialize.call(self, options);

                self.groupBy = options.groupBy;
                self.orderBy = options.orderBy;
                self.getGroupName = options.getGroupName || self.groupBy;
                self.retentionTimeSelectCallback = options.retentionTimeSelectCallback;

                self.legendIsDisplayed = options.legend || false;
                self.noAutoX = options.noAutoX;

                self.heightXAxis = 30;
                self.xicPanes = {};
                self.groupedModels = {};

                self.listenTo(self.model, 'add', self.setup);
                self.listenTo(self.model, 'reset', self.clear);

                self.p_set_selectedRange();

                self.setShiftSelectCallback(function(xs){
                    self.getMaxWithinRange(xs);
                    self.selectRange(xs);
                });

                // set the mousemovement callback
                if(self.mousemoveCallback){
                  Backbone.on("fishtonesmousemovement", function(coordinates){
                      self.mousemoveCallback(coordinates);
                  });      
                }

            },
            // prepare the plot of the range when selecting an area
            p_set_selectedRange: function () {
                var self = this;
                var cont = self.el.append('g');
                cont.attr('class', 'selectedRange');
                var highlightRectangle = cont.append('rect');
                this.highlightRectangle = highlightRectangle;
            },
            selectRange: function (rtRange) {
                var self = this;
                this.selectedRange = rtRange;
                this.render();
            },
            getMaxWithinRange: function (rtRange) {
                var self = this;

                // get max of selected ranges
                _.each(self.model.models, function(xic){
                    var points = _.zip(xic.get('retentionTimes'), xic.get('intensities'));
                    points = _.filter(points, function(p) {
                       return p[0] >= rtRange[0] && p[0] <= rtRange[1];
                    })

                    var maxInt = _.max(points, function(p){
                        return p[1];
                    })

                    if(points.length === 0) maxInt = undefined;

                    xic.set('selected', maxInt);
                });

            },
            p_init_rt_domain_selector: function (cb) {
                var self = this;
                //set the RT range selector and pipe it to a callback

                if (cb) {
                    self.setShiftSelectCallback(function (rtDomain) {
                        var rtInf = rtDomain[0]
                        var rtSup = rtDomain[1]

                        var xicclipCol = []
                        _.each(self.model.models, function (xic) {
                            var clip = xicClipperFactory.clip(xic, rtInf, rtSup);
                            clip.unset('msmsPointers')
                            xicclipCol.push(clip)
                        });
                        cb(xicclipCol, {
                            rtDomain: {
                                inf: rtInf,
                                sup: rtSup
                            }
                        });
                    });
                }
            },

            setPaneTitle: function (name, title) {
                this.xicPanes[name].title = title
            },

            clear: function () {
                var _this = this;

                _this.xicPanes = {};
                _this.groupedModels = {};
                _this.xicPanes = {};
                _this.prevPanesGroupKeys = undefined;

                _this.setup()
            },

            setup: function () {
                var _this = this;
                _this.setupPanes();
                _this.dispatchModels();

                _this.render()
            },

            /**
             * panes are build are render time, based on the groupBy property
             * befre messing everything around, we check if new panes were actually added.
             */
            setupPanes: function () {
                var self = this;
                if (self.model.size() == 0) {
                    return;
                }

                //get one XIC representatives of a panes
                var rep4panes = _.chain(self.model.models).groupBy(self.groupBy).values().map(function (l) {
                    return l[0];
                }).sortBy(self.groupBy).value();

                //extract the key per group, and return if no change.
                var panesGroupKeys = _.map(rep4panes, self.groupBy);
                if (_.isEqual(panesGroupKeys, self.prevPanesGroupKeys)) {
                    return;
                }
                self.prevPanesGroupKeys = panesGroupKeys;

                //extract group names
                self.paneNames = rep4panes.map(self.getGroupName);
                var nbPanes = rep4panes.length;

                var heightPane = Math.floor((self.height() - self.heightXAxis) / nbPanes);

                if (self.xaxisView === undefined) {
                    self.setupScalingContext({
                        height: heightPane
                    });
                    var gxaxis = self.el.append('g').attr('class', 'time-scale xaxis').attr('transform', 'translate(0,' + (self.height() - self.heightXAxis) + ')');
                    self.gxaxisBackground = gxaxis.append('rect').attr('width', self.scalingContext.width()).attr('height', self.heightXAxis).attr('class', 'background');
                    self.xaxisView = new D3XAxisView({
                        el: gxaxis.append('g'),
                        scalingContext: self.scalingContext,
                        transform: function (x) {
                            return x / 60
                        }
                    });
                    self.setupZoom();

                }

                // if the orderBy option was set and has the same length as the loaded data, we do the sorting
                if(self.orderBy && typeof self.groupBy === "function" && rep4panes.length == self.orderBy.length){
                    // create an object for ordering
                    var orderObject = {};
                    _.each(self.orderBy, function(x, i) {orderObject[x] = i;});

                    // sort the rep4panes
                    rep4panes = _.sortBy(rep4panes, function(x){return orderObject[self.groupBy(x)];});
                }

                //create panes if there are necessary
                rep4panes.forEach(function (repXic, i) {
                    var k = self.groupBy(repXic);
                    if (self.xicPanes[k] == undefined) {
                        var g = self.el.append('g');
                        self.groupedModels[k] = new XICCollection();

                        self.xicPanes[k] = new MultiXICView({
                            el: g,
                            scalingContext: self.scalingContext,
                            model: self.groupedModels[k],
                            name: self.getGroupName(repXic),
                            yaxis: true,
                            noAutoX: self.noAutoX,
                            title: self.getGroupName(repXic)

                        });
                    }
                    self.xicPanes[k].el.attr('transform', 'translate(0,' + (i * heightPane ) + ')');
                    //self.xicPanes[k].scalingContext = self.scalingContext;
                    //console.log(k, self.xicPanes[k].scalingContext)
                })
                self.scalingContext.height(heightPane);
                //console.log(self.cid, 'adding pane', name, self.xicPanes[name].cid)

            },

            setupZoom: function () {
                var self = this;
                self.xZoomable()

                self.getMaxYInXDomain = function (xmin, xmax) {
                    var ymax = _.chain(self.model.models).pluck('_dataPoints').map(function (dps) {
                        return _.chain(dps).filter(function (dp) {
                            return dp[0] >= xmin && dp[0] <= xmax;
                        }).pluck(1).max().value();
                    }).max().value();
                    return ymax * 1.1 //1.1 assert for the scalingY context majored from the real max
                }
                if (self.rtDomainSelector === undefined) {
                    self.p_init_rt_domain_selector(self.retentionTimeSelectCallback)
                } else {
                    self.rtDomainSelector.scalingContext = self.scalingContext;
                }

            },

            setupLegend: function () {
                var _this = this;
                _this.gLegend = _this.el.append('g').attr('class', 'chromato legend');
                _this.gLegend.append('rect').attr('class', 'background').attr('rx', 5).attr('ry', 5);
                return _this;
            },

            /**
             * the model is a collections, but those models should be dispatched towrads the individual  self.groupedModels[k]
             * And the point is not to update a collection that has not changed....
             *
             */
            dispatchModels: function () {
                var self = this;
                _.chain(self.model.models).groupBy(self.groupBy).each(function (lModels, k) {
                    lModels.forEach(function (x) {
                        self.groupedModels[k].add(x)
                    });
                    //self.groupedModels[k].reset(lModels);
                })
            },

            /**
             * add the legends into the box
             */
            renderLegend: function () {
                var _this = this;

                if (_this.gLegend === undefined) {
                    _this.setupLegend();
                }

                var hLine = 20;
                var wMoz = 130;
                var wText = 200;

                _this.gLegend.selectAll('g.legend-line').remove();
                var maxMoz = _.chain(_this.model.legends.list()).pluck('masses').map(function (l) {
                    return l.filter(function (m) {
                        return m;
                    }).length;
                }).max().value();
                maxMoz = Math.max(maxMoz, 0);

                _.each(_this.model.legends.list(), function (leg, iLeg) {
                    var gLine = _this.gLegend.append('g').attr('class', 'legend-line').attr('transform', 'translate(5,' + (hLine * (iLeg + 0.5)) + ')')

                    var imoz = 0;
                    _.each(leg.masses, function (moz, z) {
                        if (!moz) {
                            return;
                        }
                        var gMoz = gLine.append('g').attr('transform', 'translate(' + (imoz * wMoz) + ',0)').attr('class', ' legend-enlighter').attr('legendsublighted', '.chromato').attr('legendenlighted', '.chromato.charge_' + z + '.target_' + iLeg);
                        gMoz.append('path').attr('d', 'M0,0L50,0').attr('class', 'chromato target_' + iLeg + ' charge_' + z);
                        gMoz.append('text').text('' + z + '+ (' + moz.toFixed(4) + ')').attr('x', 55);

                        imoz++;
                    });
                    gLine.append('text').attr('x', maxMoz * wMoz).text(leg.name);
                });

                _this.gLegend.selectAll('g.legend-enlighter').on('mouseover', function () {
                    var enSel = $(this).attr('legendenlighted');
                    var subSel = $(this).attr('legendsublighted');

                    d3.selectAll(subSel).style('stroke-opacity', '15%');
                    d3.selectAll(enSel).style('stroke-opacity', null);
                    d3.selectAll(subSel).style('fill-opacity', '15%');
                    d3.selectAll(enSel).style('fill-opacity', null);
                }).on('mouseout', function () {
                    var subSel = $(this).attr('legendsublighted');
                    d3.selectAll(subSel).style('stroke-opacity', null);
                    d3.selectAll(subSel).style('fill-opacity', null);
                });

                var w = maxMoz * wMoz + wText;
                _this.gLegend.attr('transform', 'translate(' + (_this.width() - w - 20) + ',' + 40 + ')')
                _this.gLegend.selectAll('rect.background').attr('width', w).attr('height', _this.model.legends.size() * hLine);
                return _this;
            },

            render: function (options) {
                var self = this;
                if (self.xaxisView) {
                    self.xaxisView.render()
                }
                ;

                _.each(_.values(self.xicPanes), function (xv) {
                    //console.log('multipane rendering MUTLTI XIC', xv)
                    xv.render();
                });

                if (self.legendIsDisplayed) {
                    self.renderLegend();
                }

                // draw a box indicating the selected range
                if(self.selectedRange){ 
                    var x = self.scalingContext.x();//d3.scale.linear().domain(self.scalingContext.xScale.domain()).range(self.scalingContext.xScale.range())
                    var y = self.scalingContext.y();//d3.scale.linear().domain(self.scalingContext.yScale.domain()).range(self.scalingContext.yScale.range())
    
                    var rectWidth = x(self.selectedRange[1]) - x(self.selectedRange[0]);        

                    self.highlightRectangle.attr('fill', 'blue');
                    self.highlightRectangle.attr('fill-opacity', 0.3);
                    self.highlightRectangle.attr('pointer-events', 'none');
                    self.highlightRectangle.attr('width', rectWidth);
                    self.highlightRectangle.attr('height', self.height());
                    self.highlightRectangle.attr('transform', 'translate(' + x(self.selectedRange[0]) + ',' + 0 + ')').style('left', x + 'px').style('left', y + 'px').style('position', 'relative');

                }

            },

            resize: function (options) {
                var self = this;

                var h = options.height || 200;
                self.height(h).width(options.width || 500);

                self.scalingContext.width(self.width())

                // put the titles to the right
                Object.values(self.xicPanes).forEach(function(p){
                  p.elTitle.attr('x', self.width());
                });

                // adapt the brush areas
                self.gBrushBackground.attr('width', self.width());
                self.gxaxisBackground.attr('width', self.width());

                self.render();
            }

        });

        return XICMultiPaneView;
    });
