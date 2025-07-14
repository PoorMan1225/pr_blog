document.addEventListener('DOMContentLoaded', function () {
    const $inputId = document.querySelector('#input__id');
    const $inputPwd = document.querySelector('#input__pwd');
    const $inputIdLabel = document.querySelector(`label[for="${$inputId.id}"]`);
    const $inputPwdLabel = document.querySelector(`label[for="${$inputPwd.id}"]`);
    
    function focusId() {
        $inputId.classList.add('active');
        $inputIdLabel.classList.add('active');
        // 애니메이션 끝난 후 포커스 주기.
        setTimeout(() => {
            $inputId.focus();
        }, 300);
    }
    
    // 최초 focus 호출
    focusId();
    
    document.addEventListener('click', function (ev) {
        // active 제거
        $inputId.classList.remove('active');
        $inputPwd.classList.remove('active');
        
        if($inputId.value.length <= 0) {
            $inputIdLabel.classList.remove('active');
        }
        
        if($inputPwd.value.length <= 0) {
            $inputPwdLabel.classList.remove('active');
        }
        
        // pwd 또는 id 가 들어왔을때만 active 애니메이션 실행
        if(ev.target.id === 'input__pwd') {
            $inputPwd.classList.add('active');
            $inputPwdLabel.classList.add('active');
        }
        
        if(ev.target.id === 'input__id') {
            $inputId.classList.add('active');
            $inputIdLabel.classList.add('active');
        }
    });
});

