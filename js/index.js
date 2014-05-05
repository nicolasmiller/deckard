$(function() {
  "use strict";
  var cc = window.cc = new CoffeeCollider({});
  console.log(window);
  var synth = "(-> SinOscFB.ar([440, 442], mul:0.25)).play()";
    var min_line = "(->\n  freq = 799\n  SinOscFB.ar([freq, freq], mul:0.25)\n).play()";
var min_line = 
"(-> \n\
  freq = 799 \n\
  SinOscFB.ar([freq, freq], mul:0.25) \n\
).play()";
console.log(min_line);

var min_mouse = "(->\n\
  freq = MouseY.kr(100, 1000, 'exponential')\n\
  SinOscFB.ar([freq, freq], mul:0.25)\n\
).play()";

  var mouse = "(->\
  freq = MouseY.kr(100, 1000, 'exponential')\
  freq1 = freq * MouseX.kr(2, 0.5, lag:2.5)\
  freq2 = freq * MouseX.kr(0.5, 2, lag:2.5)\
  feedback = MouseButton.kr(0, 1.pi(), lag:5)\
  SinOscFB.ar([freq1, freq2], feedback, mul:0.25)\
).play()";

  var sequence = 
"pattern = [\n\
  'xxxx xxxx xxxx xxxx  Xx-- x-x- --x- x-xx'\n\
  'x--- x-x- x-x- x---  x--- x-x- -xx- ----'\n\
  '---- x--x ---- x---  ---- x--x --x- x---'\n\
  'x--- --x- ---x ----  x--- --x- -x-- x---'\n\
].map (x)-> (x.replace /\s+/g, '').split ''\n\
\n\
seq1 = SynthDef (freq=880, fb=0.45, dur=\"bpm132 l16\")->\n\
  osc = SinOscFB.ar([freq, freq * 1.025], fb) * Line.kr(0.25, 0, dur:dur, doneAction:2)\n\
  Out.ar(2, osc)\n\
.send()\n\
\n\
seq2 = SynthDef ->\n\
  osc = Saw.ar(XLine.kr(880 * 4, 220, 0.1))\n\
  osc *= EnvGen.kr(Env.perc(releaseTime:0.3, level:0.5), doneAction:2)\n\
  Out.ar(2, Pan2.ar(osc, LFCub.kr(1) * 0.75))\n\
.send()\n\
\n\
drum = SynthDef (t_hh, t_sd, t_bd)->\n\
  hh = RHPF.ar(WhiteNoise.ar(), freq:8000, rq:0.05)\n\
  hh *= EnvGen.kr(Env.perc(releaseTime:0.05, level:0.05), t_hh)\n\
  \n\
  sd = RLPF.ar(PinkNoise.ar(), freq:4000, rq:0.75)\n\
  sd *= EnvGen.kr(Env.perc(releaseTime:0.25, level:0.25), t_sd)\n\
  \n\
  bd = LPF.ar(ClipNoise.ar(8), freq:40, rq:0.5)\n\
  bd *= EnvGen.kr(Env.perc(releaseTime:0.25, level:2.5), t_bd)\n\
  \n\
  Out.ar(0, Pan2.ar(hh + sd + bd, 0))\n\
.play()\n\
\n\
efx = SynthDef ->\n\
  Out.ar(0, FreeVerb.ar(In.ar([2, 3]), room:0.75))\n\
.play()\n\
\n\
Task ->\n\
  freqs = [ 880, 440, 880*2, 220, 880*2, 660, 880*2, 660 ]\n\
  Infinity.do syncblock (i)->\n\
    switch pattern[0].wrapAt(i)\n\
      when 'x' then Synth(seq1, freq:freqs.wrapAt(i))\n\
      when 'X' then Synth(seq2)\n\
    switch pattern[1].wrapAt(i)\n\
      when 'x' then drum.set t_hh:1\n\
    switch pattern[2].wrapAt(i)\n\
      when 'x' then drum.set t_sd:1\n\
    switch pattern[3].wrapAt(i)\n\
      when 'x' then drum.set t_bd:1\n\
    \"bpm132 l16\".wait()\n\
.start()";

var message_synth = "synth = SynthDef (freq=440, gate=0)->\n\
  vco = LFSaw.ar(freq, mul:0.25)\n\
  vcf = RLPF.ar(vco, freq * 8, EnvGen.kr(Env([1, 1, 0.1], [0, 0.5], -2), gate))\n\
  vca = EnvGen.kr(Env.adsr(), gate)\n\
  Out.ar(0, (vcf * vca).dup())\n\
.play()\n\
\n\
Message.on \"keyboard\", ({midi, gate})->\n\
  synth.set freq:midi.midicps(), gate:gate";
  
  $("#run").on("click", function() {
      cc.execute(min_mouse, function(res) {
      if (res !== undefined) {
        console.log(res);
      }
    }).play();
    init();
    animate();
  });
  
  $("#stop").on("click", function() {
    cc.reset().pause();
  });
  

  var currentKey = 0;
  $("#play_note").on("click", function() {
    cc.send("keyboard", {midi:currentKey, gate:0});
    currentKey = Math.floor(Math.random() * 50) + 30;
    cc.send("keyboard", {midi:currentKey, gate:1});
  });

    console.log(cc.sampleRate);
    var camera, scene, renderer;
    var geometry, material, mesh;
    var size = 500;

    function init() {
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.z = 1000;

        scene = new THREE.Scene();

        geometry = new THREE.CubeGeometry(size, size, size);
        material = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } );

        mesh = new THREE.Mesh( geometry, material );
        scene.add( mesh );

        renderer = new THREE.CanvasRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        document.body.appendChild( renderer.domElement );
    }

    function animate() {
        // note: three.js includes requestAnimationFrame shim
        requestAnimationFrame( animate );

        var strm = cc.getStream();
        var strmL = strm.getChannelData(0);
        var strmR = strm.getChannelData(1);

        mesh.rotation.x += strmL[0];
        mesh.rotation.y += strmR[0];
//        mesh.scale.x = size * strmL[0];
//        mesh.scale.y = size * strmR[0];
//        mesh.scale.z = size * strmL[0];
        renderer.render( scene, camera );
    }
});
