var MainNav = document.querySelector ('.nav-menu');
        var NavButton = document.querySelector ('.nav-menu__header-navigation'); 
        
        NavButton.addEventListener('click', function() {
            if (MainNav.classList.contains('nav-menu--closed')) {
                MainNav.classList.remove('nav-menu--closed');
             MainNav.classList.add('nav-menu--opened');
                }
            else {
                MainNav.classList.add('nav-menu--closed');
                  MainNav.classList.remove('nav-menu--opened');
                
            }      
        });