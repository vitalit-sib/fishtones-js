/*
 For one injection, fetch the xic for two peptides and two charge states
 the color is link to the peptide, the charge state is illustrated by the number of dot on the lines
 */
fishtones.wet.Config.set('wet.url.rest', 'data-demo');


var richSeqShortcuter = new fishtones.dry.RichSequenceShortcuter({cleavageEnzyme: 'arg-c'});

//use shortcut two express these two light and heavy peptides
var peptides = ['H3.1K27Me3 [pic,prop_d0]', 'H3.1K27Me3 [silac,pic,prop_d0]'].map(function (str) {
  return richSeqShortcuter.richSeqFrom(str);
});

//XIC will be added to the collection, triggering an automatic render event
var xicCol = new fishtones.wet.XICCollection();

 var groupFunction = function(xic){
  return xic.cid;
}

var multiPanes = new fishtones.wet.XICMultiPaneView({
  el: '#xic-rtbar-multipanel-viz',
  model: xicCol,
  groupBy: groupFunction,
  orderBy: ['c1001', 'c670', 'c697', 'c984']
})

new fishtones.wet.Injection({id: 42}).fetch({
    success: function (inj) {
      //loop over the peptides
      _.each(peptides, function (pept, iPept) {
        //loop of charge states
        _.each([2, 3], function (z) {
          var moz = fishtones.dry.MassBuilder.computeMassRichSequence(pept, z);
          inj.chromatoXic(moz, {
            selectedRt       : 1800.0,
            charge      : z,
            //richSequence: pept,
            target      : iPept
          }, function (x) {
            // replace msmsPointers by precursors to show the bars
            var precursors = _.map(x.get('msmsPointers'), function(x){return {retentionTime: x.retentionTime}});
            x.set('precursors', precursors);
            x.unset('msmsPointers');
          
            console.log(x);
            x.set('id', x.get('mass'));
            xicCol.add(x);
          });
        });
      });

    }
  }
);




