---
layout: null
---

$(function() {
  var toc     = $('.toc-link'),
      sidebar = $('#sidebar'),
      main    = $('#main'),
      menu    = $('#menu'),
      button     = $('#menu-icons.icon-arrow'),
      content    = $('.post.container'),
      x1, y1;

  // run this function after pjax load.
  var afterPjax = function() {
    // open links in new tab.
    $('#main').find('a').filter(function() {
      return this.hostname != window.location.hostname;
    }).attr('target', '_blank');

    // discus comment.
    {% if site.disqus_shortname %}
    (function() {
      var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
      dsq.src = '//{{ site.disqus_shortname }}' + '.disqus.com/embed.js';
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();
    {% endif %}

    // your scripts
  };
  afterPjax();


  // NProgress
  NProgress.configure({ showSpinner: false });


  // Pjax
  $(document).pjax('#sidebar-avatar, .toc-link', '#main', {
    fragment: '#main',
    timeout: 3000
  });

  $(document).on({
    'pjax:click': function() {
      NProgress.start();
      main.removeClass('fadeIn');
    },
    'pjax:end': function() {
      afterPjax();
      NProgress.done();
      main.scrollTop(0).addClass('fadeIn');
      // only remove open in small screen
      if($(window).width() <= 767) {
        menu.add(sidebar).add(main).removeClass('open');
      }     
      {% if site.google_analytics %}
      ga('set', 'location', window.location.href);
      ga('send', 'pageview');
      {% endif %}
    }
  });
  
  // Search
  $('#search-input').on('input', function(e){
    var blogs = $(".toc-link").filter(function() {
      var reg = new RegExp($('#search-input').val(), "i");
      return reg.test($(this).text());
    });
    toc.hide();
    blogs.fadeIn(350);
  });

  // Tags Filter
  $('#sidebar-tags').on('click', '.sidebar-tag', function() {
    var filter = $(this).data('filter');
    if (filter === 'all') {
      toc.fadeIn(350);
    } else {
      toc.hide();
      $('.toc-link[data-tags~=' + filter + ']').fadeIn(350);
    }
    $(this).addClass('active').siblings().removeClass('active');
  });

  // Enable fullscreen.
  $('#menu.js-fullscreen').on('click', function() {
    $(this).add(sidebar).toggleClass('open');
    if (button.hasClass('fullscreen')) {
      sidebar.removeClass('fullscreen');
      main.removeClass('fullscreen');
      button.removeClass('fullscreen');
      content.delay(300).queue(function(){
        $(this).removeClass('fullscreen').dequeue();
      });
    } else {
      sidebar.addClass('fullscreen');
      main.addClass('fullscreen');
      button.addClass('fullscreen');
      content.delay(200).queue(function(){
        $(this).addClass('fullscreen').dequeue();
      });
    }
  });
});
