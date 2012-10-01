$(document).ready(function() {
  // Handler for .ready() called.
  $('img.photo').attr('width',($(window).width() - 8) /8 );

  $('img.photo').imagesLoaded( function( $images, $proper, $broken ) {
    console.log( $images.length + ' images total have been loaded' );
    console.log( $proper.length + ' properly loaded images' );
    console.log( $broken.length + ' broken images' );

    $('#photos').isotope({
      // options
      itemSelector : '.photo-wrapper',
      layoutMode : 'masonry',
    });
  });

  $("#btn-settings").click(function(){
      $("#panel-settings").fadeIn(300);
    $("#overlay").fadeIn(300,function(){
    });
  });


  $("#btn-close-settings").click(function(){
      $("#panel-settings").fadeOut(300);
    $("#overlay").fadeOut(300,function(){
    });
  })
});
