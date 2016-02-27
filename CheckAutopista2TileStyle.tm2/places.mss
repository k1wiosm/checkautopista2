#country_label[zoom>=3] {
  text-name: @name;
  text-face-name: @sans_bold;
  text-fill: @country_text;
  text-size: 12;
  text-halo-fill: @land;
  text-halo-radius: 2;
  text-wrap-width: 50;
  text-margin: 5;
  [zoom>=3][scalerank=1],
  [zoom>=4][scalerank=2],
  [zoom>=5][scalerank=3],
  [zoom>=6][scalerank>3] {
    text-size: 14;
  }
  [zoom>=4][scalerank=1],
  [zoom>=5][scalerank=2],
  [zoom>=6][scalerank=3],
  [zoom>=7][scalerank>3] {
    text-size: 16;
  }
}

#place_label[localrank<=3] {
  text-name: @name;
  text-face-name: @sans;
  text-fill: @place_text;
  text-size: 12;
  text-halo-fill: @land;
  text-halo-radius: 2;
  text-wrap-width: 50;
  text-margin: 5;
  [type='city'][zoom<=15] {
    text-size: 12;
    [zoom>=8] { text-size: 14; }
    [zoom>=10] { text-size: 16; }
    [zoom>=12] { text-size: 20; }
  }
  [type='town'][zoom<=17] {
    text-size: 12;
    [zoom>=12] { text-size: 14; }
  }
  [type='village'] {
    text-size: 10;
    [zoom>=12] { text-size: 12; }
    [zoom>=14] { text-size: 14; }
  }
  [type='hamlet'],
  [type='suburb'],
  [type='neighbourhood'] {
    text-size: 12;
    [zoom>=14] { text-size: 14; }
    [zoom>=16] { text-size: 16; }
  }
}
