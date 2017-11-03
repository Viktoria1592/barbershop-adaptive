window.onload = function() {
  var mySwiper = new Swiper('.swiper-container', {
    slidesPerView: 1,
      setWrapperSize: true,
    // spaceBetween: 40,
    speed: 300,
    pagination: {
      el: '.slider__control',
      clickable: true,
    },
    navigation: {
      nextEl: '.service-examples__review-next',
      prevEl: '.service-examples__review-prew',
    },
    breakpoints: {
      // 1280: {
      //   slidesPerView: 3,
      //   spaceBetween: 40,
      // },
      // 1024: {
      //   slidesPerView: 2,
      //   spaceBetween: 60,
      // },
      // 640: {
      //   slidesPerView: 1,
      // },
    },
  });
}