$(document).ready(function() {
  $('img.photo').attr('width',($(window).width() - 8) /8 );

  $('img.photo').imagesLoaded( function( $images, $proper, $broken ) {
    $('#photos').isotope({
      itemSelector : '.photo-wrapper',
      layoutMode : 'masonry',
    });
  });

  $("#btn-settings").click(function(){
    $("#panel-settings").fadeIn(300);
    $("#overlay").fadeIn(300,function(){
    });
  });

  $("a.photo-link").click(function(evt){
    evt.preventDefault();
    var leftOffset = $(this).parent().position().left - ($(".zoomed-in").width() / 2 ) + ($(this).width());
    var topOffset = $(this).parent().position().top - ($(window).height() / 2 ) + ($(this).height());
    console.log(leftOffset + "px " + topOffset + "px ");
    $("#photos").css('-webkit-transform-origin', leftOffset + "px " + topOffset + "px ");
    $("#photos").addClass('zoom-in');
    $(".selected").removeClass('selected');
    $(this).addClass('selected');
    setTimeout(function(){
      $("#photos").addClass('zoomed-in');
    }, 500);
    // $("#main-photo").attr('src',$(this).children('.photo').attr('src'));
    // $("#panel-photo").fadeIn(300);
    // $("#overlay").fadeIn(300,function(){
    // });
  });

  $("#btn-close-settings").click(function(){
    $("#panel-settings").fadeOut(300);
    $("#overlay").fadeOut(300,function(){
    });
  })
});
