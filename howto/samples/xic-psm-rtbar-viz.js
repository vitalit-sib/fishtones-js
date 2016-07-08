/*
 fetch an XIC and display it, aigning MS/MS spectra with a targeted peptide
 */
fishtones.wet.Config.set('wet.url.rest', 'data-demo');

var peptide = new fishtones.dry.RichSequence()
    .fromString('{PIC}K{Trimethyl}SAPATGGVK{Propionyl}K{Propionyl}PHR');

new fishtones.wet.Injection({id: 42}).fetch({
    success: function (inj) {
      inj.chromatoXic(fishtones.dry.MassBuilder.computeMassRichSequence(peptide,3), {
        success: function (xic) {
          var precursors = _.map(xic.get('msmsPointers'), function(x){return {retentionTime: x.retentionTime}});
          // replace msmsPointers by precursors to show the bars
          xic.set('precursors', precursors);
          xic.unset('msmsPointers');
          console.log(xic);
          var v = new fishtones.wet.XICView({
            model       : xic,
            el          : '#xic-rtbar-viz'
          });
          v.xZoomable()
          v.render();
        }
      });
    }
  }
);

