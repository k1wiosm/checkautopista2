@name: '[name]';

@sans: 'Arial Unicode MS Regular';
@sans_bold: 'Arial Unicode MS Bold';
@sans_italic: 'Arial Unicode MS Regular';

@fill1: #fff;
@fill2: #ddd;
@fill3: #bbb;
@fill4: #777;
@fill5: #000;

@land:  #eee;
@water: @fill2;
@admin_bound: @fill3;
@road:  #fff;
@motorway: #000;
@motorway_link: #5a5a5a;
@motorway_text: #000;
@text: #777;
@country_text: @text;
@place_text: @text;
@suburb_text: #666;

Map { background-color: @land; }

// Political boundaries //

#admin[maritime=0] {
  line-join: round;
  line-color: @admin_bound;
  line-width: 0;
  [admin_level=2] {
    line-width: 1;
    [zoom>=6] { line-width: 2; }
    [zoom>=8] { line-width: 4; }
  }
  [disputed=1] { line-dasharray: 4,4; }
  [admin_level>2][zoom>=3] { 
    line-width: 1;
    line-dasharray: 3,2; 
    [zoom>=6] { line-width: 1.5; }
    [zoom>=8] { line-width: 3; }
  }
}

// Land Features //

#landuse[class='cemetery'],
#landuse[class='park'],
#landuse[class='wood'],
#landuse_overlay {
  polygon-fill: darken(@land,3);
  [zoom>=15] { polygon-fill:mix(@land,@fill4,95); }
}

#landuse[class='pitch'],
#landuse[class='sand'] { 
  polygon-fill: mix(@land,@fill4,90);
}

#landuse[class='hospital'],
#landuse[class='industrial'],
#landuse[class='school'] { 
  polygon-fill: mix(@land,@fill1,95);
}

#building { 
  polygon-fill: mix(@fill2,@land,25);
  [zoom>=16]{ polygon-fill: mix(@fill2,@land,50);}
}

#aeroway {
  ['mapnik::geometry_type'=3][type!='apron'] { 
    polygon-fill: mix(@fill2,@land,25);
    [zoom>=16]{ polygon-fill: mix(@fill2,@land,50);}
  }
  ['mapnik::geometry_type'=2] { 
    line-color: mix(@fill2,@land,25);
    line-width: 1;
    [zoom>=13][type='runway'] { line-width: 4; }
    [zoom>=16] {
      [type='runway'] { line-width: 6; }
      line-width: 3;
      line-color: mix(@fill2,@land,50);
    }
  }
}