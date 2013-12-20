$(function() {
  "use strict";
  var cc = window.cc = new CoffeeCollider({});
  var synth = "(-> SinOscFB.ar([440, 442], mul:0.25)).play()";
  
  $("#run").on("click", function() {
    cc.execute(synth, function(res) {
      if (res !== undefined) {
        console.log(res);
      }
    }).play();
  });
  
  $("#stop").on("click", function() {
    cc.reset().pause();
  });
});
