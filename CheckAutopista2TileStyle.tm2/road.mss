#road[class!='motorway'] {
  line-color: @fill1;
  line-width: 0.5;
  [class='trunk'],
  [class='primary'],
  [class='secondary'],
  [class='tertiary'] {
    [zoom>=10] { line-width: 1; }
    [zoom>=12] { line-width: 2; }
    [zoom>=14] { line-width: 3; }
    [zoom>=16] { line-width: 5; }
  }
  [class='street'],
  [class='street_limited'] {
    [zoom>=14] { line-width: 1; }
    [zoom>=16] { line-width: 2; }
  }
  [class='street_limited'] { line-dasharray: 4,1; }
}

#road[class='motorway'],
#road[class='motorway_link'] {
  ::fill {
    line-width: 0.5;
    line-color: @fill1;
    [zoom>=5] { line-width: 4; }
    [zoom>=10] { line-width: 7; }
    [zoom>=15] { line-width: 10; }
  }
  ::line {
    line-width: 1;
    [class='motorway'] {
      line-color: @fill5;
    }
    [class='motorway_link'] {
      line-color: @fill3;
    }
    [structure='tunnel'] {
      line-dasharray: 3,2;
    }
  }
  ::bridge-left[zoom>=14] {
    [structure='bridge'] {
      line-width: 0.5;
      [zoom>=14] { line-offset: 2; }
      [zoom>=16] { line-offset: 5; }
      [class='motorway'] { line-color: @fill5; }
      [class='motorway_link'] { line-color: @fill3; }
    }
  }
  ::bridge-right[zoom>=14] {
    [structure='bridge'] {
      line-width: 0.5;
      [zoom>=14] { line-offset: -2; }
      [zoom>=16] { line-offset: -5; }
      [class='motorway'] { line-color: @fill5; }
      [class='motorway_link'] { line-color: @fill3; }
    }
  }
}

#road_label[class='motorway'] {
  ::shield {
    text-name: [ref];
    text-placement: point;
    text-face-name: @sans_bold;
    text-size: 12;
    text-margin: 10;
    text-repeat-distance: 50;
    text-min-padding: 5;
    text-halo-fill: @fill1;
    text-halo-radius: 2;
  }
  ::name {
    text-name: [name];
    text-face-name: @sans_bold;
    text-placement: line;
    text-size: 12;
    text-dy: 5;
    text-margin: 20;
    text-repeat-distance: 80;
    text-min-padding: 5;
    text-halo-fill: @fill1;
    text-halo-radius: 2;
  }
}

 #motorway_junction[zoom>=13] {
  text-name: [ref];
  text-face-name: @sans;
  text-size: 10;
  text-halo-fill: @land;
  text-halo-radius: 2;
}