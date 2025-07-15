document.addEventListener('DOMContentLoaded', () => {
    const $inputId = document.querySelector('#input__id');
    const $labelId = document.querySelector('label[for="input__id"]');
    const $inputPwd = document.querySelector('#input__pwd');
    const $labelPwd = document.querySelector('label[for="input__pwd"]');
    const $btnLogin = document.querySelector('.login__form button');
    const $btnIdClear = document.querySelector('#btn__idclear');
    const $btnPwdClear = document.querySelector('#btn__pwdclear');
    
    // 최초 ID 포커스
    focusAndAnimate($inputId, $labelId);
    $btnLogin.disabled = true;
    
    // 이벤트 바인딩
    [$inputId, $inputPwd].forEach(($input) => {
        $input.addEventListener('input', handleInputChange);
    });
    
    document.addEventListener('click', handleDocumentClick);
    
    // clear 버튼 클릭
    $btnIdClear.addEventListener('click', function () {
        $inputId.value = '';
        $btnIdClear.style.visibility = 'hidden';
    });
    $btnPwdClear.addEventListener('click', function () {
        $inputPwd.value = '';
        $btnPwdClear.style.visibility = 'hidden';
    });
    
    //함수 정의
    function handleInputChange() {
        const isEmpty = !$inputId.value.trim() || !$inputPwd.value.trim();
        $btnLogin.disabled = isEmpty;
        
        $btnIdClear.style.visibility = !$inputId.value.trim() ? 'hidden' : 'visible';
        $btnPwdClear.style.visibility = !$inputPwd.value.trim() ? 'hidden' : 'visible';
    }
    
    function handleDocumentClick(ev) {
        const target = ev.target;
        
        toggleActiveState($inputId, $labelId, false);
        toggleActiveState($inputPwd, $labelPwd, false);
        
        if (target === $inputId) {
            toggleActiveState($inputId, $labelId, true);
        } else if (target === $inputPwd) {
            toggleActiveState($inputPwd, $labelPwd, true);
        }
    }
    
    function toggleActiveState($input, $label, shouldActivate) {
        if (shouldActivate || $input.value.trim()) {
            $input.classList.add('active');
            $label.classList.add('active');
        } else {
            $input.classList.remove('active');
            $label.classList.remove('active');
        }
    }
    
    function focusAndAnimate($input, $label) {
        $input.classList.add('active');
        $label.classList.add('active');
        setTimeout(() => $input.focus(), 300);
    }
});
