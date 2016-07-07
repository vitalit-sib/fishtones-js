/*
 show nothing but a lign with a callback
 */

var prec = new fishtones.match.PrecursorPeak({
  rt: 1
});

new fishtones.match.MatchMapRtBarView({
  model    : prec,
  el       : $('#target').find('#psm-viz-rtbar'),
  xZoomable: true,
  barHeight   :60,
  onclickCallback: function(){ console.log('bar at ' + prec.rt + ' got clicked') },
  mouseoverCallback: function(){ console.log('move over bar at ' + prec.rt) },
  mouseoutCallback: function(){ console.log('move out of bar at ' + prec.rt) }
}).render();
    
  

