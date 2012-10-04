$(document).ready(function() {
  $('img.photo').attr('width',($("#container").width() - 20) /8 );

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
    var leftOffset = $(this).parent().position().left - ($(".zoomed-in").width() / 2 ) + ($(this).width() * 2);
    var topOffset = $(this).parent().position().top - ($(window).height() / 2 ) + ($(this).height());
    console.log(leftOffset + "px " + topOffset + "px ");
    $("#photos").css('-webkit-transform-origin', leftOffset + "px " + topOffset + "px ");
    $("#photos").addClass('zoom-in');
    $(".selected").removeClass('selected');
    $(this).parent().addClass('selected');
    $(".post-details").hide();
    $(".post-details."+$(this).data('post-id').substring(1,$(this).data('post-id').length-1)).show();

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

  $("a.colorway").click(function(){
    window.location.href = "/color/r/"+$(this).attr('r')+"/g/"+$(this).attr('g')+"/b/"+$(this).attr('b');
  })
});


function showPhotoDetails($photoLink){
  $("#photo-details").show();

}