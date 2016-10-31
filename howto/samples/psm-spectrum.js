/*
 align a theoretical peptide and an experimental spectrum
 and display the alignment in an annotated spectrum
 */
fishtones.wet.Config.set('wet.url.rest', 'data-demo');

var peptide = new fishtones.dry.RichSequence()
    .fromString('ESEDKPEIEDVGS{Phospho}DEEEEK');
//  .fromString('{Propionyl}K{Acetyl}SAPATGGVK{Propionyl}K{Propionyl}PHR');

var fish;

new fishtones.wet.ExpMSMSSpectrum({id: 'F004095_5787'})
//new fishtones.wet.ExpMSMSSpectrum({id: 'K27Ac'})
  .fetch({
    success: function (sp) {
      var psm = new fishtones.match.PSMAlignment({
        richSequence: peptide,
        expSpectrum: sp,
        annotatePhospho: true
      });

      fish = new fishtones.match.MatchSpectrumView({
        model    : psm,
        el       : $('#target').find('#psm-viz'),
        //tol      : 300,
        tol      : 0.02,
        tolUnity : 'dalton',
        xZoomable: true
      });
      fish.render();
    }
  });

  $('#resetButton')[0].onclick = function(){
    console.log("reset sp");
    console.log(fish);
    console.log(fish.scalingContext._xDomain);

    fish.scalingArea.model.reset();
  }

  $('#zoomButton')[0].onclick = function(){
    console.log("zoom sp");
    fish.scalingContext.xDomain([800,2000]);
  }

