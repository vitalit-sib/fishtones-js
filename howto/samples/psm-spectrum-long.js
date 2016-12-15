/*
 align a theoretical peptide and an experimental spectrum
 and display the alignment in an annotated spectrum
 */
fishtones.wet.Config.set('wet.url.rest', 'data-demo');

var peptide = new fishtones.dry.RichSequence()
    .fromString('MYQGAGGEAGGPGASGMDDDAPPASGGAGPK');

var fish;

new fishtones.wet.ExpMSMSSpectrum({id: 'F004483_10873'})
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
        tol      : 500,
        tolUnity : 'ppm',
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

