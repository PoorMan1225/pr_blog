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
    
    // input 이벤트 바인딩
    [$inputId, $inputPwd].forEach(($input) => {
        $input.addEventListener('input', handleInputChange);
        $input.addEventListener('focus', focusChange);
    });
    
    document.addEventListener('click', handleDocumentClick);
    
    /**
     * 클리어 버튼 클릭시 발생 이벤트
     */
    $btnIdClear.addEventListener('click', function () {
        $inputId.value = '';
        $btnIdClear.style.visibility = 'hidden';
    });
    $btnPwdClear.addEventListener('click', function () {
        $inputPwd.value = '';
        $btnPwdClear.style.visibility = 'hidden';
    });
    
    /**
     * input 값 변경시 발생 이벤트
     * 값있을 경우 clearbutton 활성화 없을 경우 비활성화
     */
    function handleInputChange() {
        const isEmpty = !$inputId.value.trim() || !$inputPwd.value.trim();
        $btnLogin.disabled = isEmpty;
        
        $btnIdClear.style.visibility = !$inputId.value.trim() ? 'hidden' : 'visible';
        $btnPwdClear.style.visibility = !$inputPwd.value.trim() ? 'hidden' : 'visible';
    }
    
    /**
     * document 클릭시에 애니메이션 해제 (input 제외)
     * @param ev
     */
    function handleDocumentClick(ev) {
        const target = ev.target;
        if(target !== $inputId) {
            toggleActiveState($inputId, $labelId, false);
        }
        if(target !== $inputPwd) {
            toggleActiveState($inputPwd, $labelPwd, false);
        }
    }
    
    /**
     * input focus 발생시 애니메이션 효과 추가
     * @param ev
     */
    function focusChange(ev) {
        const target = ev.target;
        if (target === $inputId) {
            toggleActiveState($inputId, $labelId, true);
        } else if (target === $inputPwd) {
            toggleActiveState($inputPwd, $labelPwd, true);
        }
    }
    
    /**
     * input 버튼을 누르거나 했을때 input 애니메이션 제거 또는 활성화
     * @param $input
     * @param $label
     * @param shouldActivate 애니메이션 활성화 여부
     */
    function toggleActiveState($input, $label, shouldActivate) {
        if (shouldActivate || $input.value.trim()) {
            $input.classList.add('active');
            $label.classList.add('active');
        } else {
            $input.classList.remove('active');
            $label.classList.remove('active');
        }
    }
    
    /**
     * 최초 포커스시 애니메이션
     * @param $input
     * @param $label
     */
    function focusAndAnimate($input, $label) {
        $input.classList.add('active');
        $label.classList.add('active');
        setTimeout(() => $input.focus(), 300);
    }
});
