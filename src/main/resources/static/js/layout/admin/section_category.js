document.addEventListener("DOMContentLoaded", function () {
    const $btns = document.querySelectorAll('.category__root .btns__default button');
    console.log($btns);
    const $categoryController = document.querySelector('.category__root .category__controller');
    $btns.forEach(($btn) => {
        console.log($btn);
        $btn.addEventListener('click', function (ev){
            console.log(ev);
            const type = ev.target.dataset.type;
            if(type === 'add') {
              const childItem = `<li class="category__item">
                    <div class="left">
                        <div class="icons">
                            <div class="icon__block subtree">
                                <span class="none"></span>
                            </div>
                            <div class="icon__block edit">
                                <span class="icon"></span>
                            </div>
                        </div>
                        <form>
                            <label>
                                <input type="text">
                            </label>
                        </form>

                        <div class="select__container">
                            <button>
                                <span class="select__menu__title">주제 없음</span>
                                <span class="icon__dropdown"></span>
                            </button>
                            <ul class="select__menus">
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
                            <button>취소</button>
                            <button>확인</button>
                        </div>
                    </div>
                </li>`;
              $categoryController.insertAdjacentElement('beforeend', childItem);
            }
        });
    });
});