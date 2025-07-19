document.addEventListener("DOMContentLoaded", function () {
    // 사이드 메뉴 클릭 이벤트 수신
    window.addEventListener('sideMenuClick', (event) => {
        const {section_title, url} = event.detail;
        
        if (url !== '/admin/category') return;
        
        const categoryMenuItem = {
            'category-title': '게시글 제목',
            'category-tag': '내용입니다',
            categoryId: 3
        };
        const categoryList = [];  // 카테고리 정보 담는 리스트
        const $categoryController = document.querySelector('.category__controller');
        const $btns = document.querySelectorAll('.category__root .btns__default button');
        
        if (!$categoryController || $btns.length === 0) return;
        
        // 버튼 클릭 이벤트 (중복 방지)
        $btns.forEach(($btn) => {
            $btn.addEventListener('click', function (ev) {
                const type = ev.target.dataset.type;
                
                if (type === 'add') {
                    const $li = createCategoryItem();
                    const $input = $li.querySelector('input[type="text"]');
                    const $selectedBox = $li.querySelector('.selected__title');
                    $categoryController.appendChild($li);
                    
                    // form event binding
                    const $btnsEdits = $li.querySelector('.btns__edit');
                    $btnsEdits.addEventListener('click', function (ev) {
                        const className = ev.target.className;
                        const dataType = $li.dataset.type;
                        if (className === 'btn__cancel') {
                            // 타입이 그냥 추가일 경우 노드 요소 삭제
                            if (dataType === 'add') {
                                $li.remove();
                            } else if (dataType === 'edit') {
                                $li.dataset.type = 'confirm';
                                $input.disabled = true;
                            }
                        }
                        
                        if (className === 'btn__confirm') {
                            console.log(className);
                            $li.dataset.type = 'confirm';
                            // todo 슬슬 데이터 동기화 해야할듯.
                            // $selectedBox.textContent = ''
                            // input 입력 비활성화
                            $input.disabled = true;
                        }
                    });
                    const $btnDefaults = $li.querySelector('.btns__default');
                    $btnDefaults.addEventListener('click', function (ev) {
                        console.log(ev);
                        const className = ev.target.className;
                        if (className === 'btn__add') {
                            // todo 자식노드 바인딩 시켜야함
                        } else if (className === 'btn__edit') {
                            $li.dataset.type = 'edit';
                            $input.disabled = false;
                        } else if (className === 'btn__delete') {
                            $li.remove();
                        }
                    });
                    // Init 카테고리 input select menu binding
                    bindingCategoryInputEvent($li);
                    bindingSelectMenusEvent($li);
                }
            });
        });
    });
    
    document.addEventListener('click', function (ev) {
    
    });
    
    // 💡 HTML 문자열 대신 DOM 요소로 생성
    function createCategoryItem() {
        const li = document.createElement('li');
        li.className = 'category__item';
        li.setAttribute('data-type', 'add');
        li.innerHTML = `
                    <div class="left">
                        <div class="icons">
                            <div class="icon__block subtree">
                                <span class="none"></span>
                            </div>
                            <div class="icon__block drag">
                                <span class="icon"></span>
                            </div>
                        </div>
                        <label for="category__title">
                            <input id="category__title" class="ellipsis" type="text">
                        </label>
                        <div class="selected__title__box">
                            <span class="selected__title"></span>
                        </div>
                        <div class="select__container">
                            <button>
                                <span class="select__menu__title">주제 없음</span>
                                <span class="icon__dropdown"></span>
                            </button>
                            <ul class="select__menus">
                                <li>주제없음</li>
                                <li>주제선정1</li>
                                <li>주제선정2</li>
                                <li>주제선정3</li>
                                <li>주제선정4</li>
                                <li>주제선정5</li>
                            </ul>
                        </div>
                    </div>
                    <div class="right">
                        <div class="btns__edit">
                            <button class="btn__cancel">취소</button>
                            <button disabled class="btn__confirm">확인</button>
                        </div>
                        <div class="btns__default">
                            <button class="btn__add">추가</button>
                            <button class="btn__edit">수정</button>
                            <button class="btn__delete">삭제</button>
                        </div>
                    </div>`;
        return li;
    }
    
    // Init 카테고리 input select menu binding
    function bindingSelectMenusEvent($li) {
        // 주제선정 메뉴 설정
        const $selectContainer = $li.querySelector('.select__container');
        const $btnSelect = $selectContainer.querySelector('button');
        const $selectMenuTitle = $selectContainer.querySelector('.select__menu__title');
        
        if (!$selectContainer || !$btnSelect || !$selectMenuTitle) return;
        
        function selectMenuToggle() {
            // dropdown toggle
            if ($selectContainer.classList.contains('active')) {
                $selectContainer.classList.remove('active');
            } else {
                $selectContainer.classList.add('active');
            }
        }
        
        $btnSelect.addEventListener('click', function (ev) {
            const $btn = ev.target;
            selectMenuToggle();
        });
        
        // menus li 바인딩
        const $selectMenus = $li.querySelector('.select__menus');
        $selectMenus.addEventListener('click', function (ev) {
            $selectMenuTitle.textContent = ev.target.textContent;
            selectMenuToggle();
        });
    }
    
    // Input 카테고리 이벤트 바인딩
    function bindingCategoryInputEvent($li) {
        const $btnConfirm = $li.querySelector('.right .btn__confirm');
        const $input = $li.querySelector('input[type="text"]');
        
        if (!$btnConfirm || !$input) return;
        
        $input.addEventListener('input', function (ev) {
            const text = ev.target.value.trim();
            $btnConfirm.disabled = text.length <= 0;
        });
    }
});
