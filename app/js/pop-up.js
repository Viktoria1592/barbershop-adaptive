var link = document.querySelector('.nav-menu__entry');
var popup = document.querySelector('.pop-up');
var close = popup.querySelector('.modal-close');
var overLay = document.querySelector('.modal-overlay');
var login = popup.querySelector('.pop-up__field--login');
var form = popup.querySelector('form');
var password = popup.querySelector('.pop-up__field--password');
var storage = localStorage.getItem('login');
var formList = document.querySelector('.service-form__description');
var popupSuccess = document.querySelector('.pop-up-success');
var popupFail = document.querySelector('.pop-up-fail');
if (formList) {
    var requiredName = formList.querySelector('.service-form__input--required-name');
    var requiredNumber = formList.querySelector('.service-form__input--required-number');
    var requiredSurname = formList.querySelector('.service-form__input--required-surname');
};
var closeButton = document.querySelector('.modal-button');
var closeWindow = document.querySelector('.modal-button-close');
link.addEventListener('click', function (event) {
    event.preventDefault();
    popup.classList.add('pop-up--active');
    overLay.classList.add('modal-overlay--active');
    if (storage) {
        login.value = storage;
        password.focus();
    }
    else {
        login.focus();
    }
});
close.addEventListener('click', function (event) {
    event.preventDefault();
    popup.classList.remove('pop-up--active');
    popup.classList.remove('pop-up--error');
    overLay.classList.remove('modal-overlay--active');
});
form.addEventListener('submit', function (event) {
    if (!login.value || !password.value) {
        event.preventDefault();
        popup.classList.add('pop-up--error');
    }
    else {
        localStorage.setItem('login', login.value);
    }
});
window.addEventListener('keydown', function (event) {
    if (event.keyCode === 27) {
        if (popup.classList.contains('pop-up--active')) {
            popup.classList.remove('pop-up--active');
        }
        if (overLay.classList.contains('modal-overlay--active')) {
            overLay.classList.remove('modal-overlay--active');
        }
        if (popupSuccess.classList.contains('pop-up-success--active')) {
            popupSuccess.classList.remove('pop-up-success--active');
        }
        if (popupFail.classList.contains('pop-up-fail--active')) {
            popupFail.classList.remove('pop-up-fail--active');
        }
    }
});
if (formList) {
    formList.addEventListener('submit', function validateForm() {
        if (!requiredName.value || !requiredNumber.value || !requiredSurname.value) {
            event.preventDefault();
            popupFail.classList.add('pop-up-fail--active');
            overLay.classList.add('modal-overlay--active');
        }
        else {
            //         event.preventDefault();
            return false;
            localStorage.setItem('requiredName', requiredName.value);
            popupSuccess.classList.add('pop-up-success--active');
            overLay.classList.add('modal-overlay--active');
        }
    })
};
if (closeButton) {
    closeButton.addEventListener('click', function (event) {
        event.preventDefault();
        if (popupFail.classList.contains('pop-up-fail--active')) {
            popupFail.classList.remove('pop-up-fail--active');
            overLay.classList.remove('modal-overlay--active');
        };
    })
};
if (closeWindow) {
    closeWindow.addEventListener('click', function (event) {
        event.preventDefault();
        if (popupSuccess.classList.contains('pop-up-success--active')) {
            popupSuccess.classList.remove('pop-up-success--active');
            overLay.classList.remove('modal-overlay--active');
        };
    })
};
//if (!requiredSurname.value) {
//requiredSurname.classList.add('service-form__input--required-surname-empty')};