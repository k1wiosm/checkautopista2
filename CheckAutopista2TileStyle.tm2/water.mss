#water {
  ::shadow {
    polygon-fill: mix(@land,@fill5,75);
  }
  ::fill {
    polygon-fill: @land;
    comp-op: soft-light;
    image-filters: agg-stack-blur(10,10);
  }
}

#marine_label[zoom>=3] { 
  text-name: @name;
  text-face-name: @sans_bold;
  text-fill: @land;
  text-size: 12;
  [placement="line"] { 
    text-placement: line;
  }
  [placement="point"] {
    text-wrap-before: true;
    text-wrap-width: 50;
  }
  text-halo-fill: @fill3;
  text-halo-radius: 1;
  [labelrank=1] {
   text-size: 18;
  }
}

#water_label {
  [zoom<=13],
  [zoom>=14][area>500000],
  [zoom>=16][area>10000],
  [zoom>=17] {
    text-name: @name;
    text-face-name: @sans_bold;
    text-fill: @text;
    text-size: 12;
    text-halo-fill: @water;
    text-halo-radius: 1;
    text-wrap-width: 60;
    text-wrap-before: true;
    text-avoid-edges: true;
  }
}

#waterway {
  [type='river'],
  [type='canal'] {
    line-color: @water;
    line-width: 0.5;
    [zoom>=12] { line-width: 1; }
    [zoom>=14] { line-width: 2; }
    [zoom>=16] { line-width: 3; }
  }
  [type='stream'] {
    line-color: @water;
    line-width: 0.5;
    [zoom>=14] { line-width: 1; }
    [zoom>=16] { line-width: 2; }
    [zoom>=18] { line-width: 3; }
  }
}