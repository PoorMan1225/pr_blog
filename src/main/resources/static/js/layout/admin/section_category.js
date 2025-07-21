import generateUUID from "../../utils/uuid.js";
import getCsrfToken, {apiFetch} from "../../utils/api.js";

/*────────────────────────────────────
  정보 저장 클래스
────────────────────────────────────*/

class CategoryMenuItem {
    constructor(id, parentId = null, serverId = null, title = "", tag = 1) {
        this.id = id;                   // 현재 자신의 uuid
        this.parentId = parentId;       // 부모의 uuid
        this.serverId = serverId;       // 서버에서 받아온 pk
        this.categoryTitle = title;     // 타이틀 값
        this.categoryTag = tag;         // 태그 값
        this.isChanged = false;         // 변경 되었는지 여부
    }
    
    updateTag(tag) {
        if (this.categoryTag !== tag) {
            this.categoryTag = tag;
            this.isChanged = true;
        }
    }
    
    updateTitle(title) {
        if (this.categoryTitle !== title) {
            this.categoryTitle = title;
            this.isChanged = true;
        }
    }
}


/*────────────────────────────────────
  element 동적 생성
────────────────────────────────────*/
/**
 *  타이틀 메뉴 바인딩
 * @param categoryTitleMap 카테고리 타이틀 map 객체
 * @returns {HTMLUListElement} ul 태그 반환
 */
function createCategoryTitle(categoryTitleMap) {
    const $ul = document.createElement('ul');
    $ul.className = 'select__menus';
    // map 은 in 으로 받으면 index 를 가져와서 of 로 받아야 한다.
    for (const [key, categoryTitle] of categoryTitleMap.entries()) {
        const $li = document.createElement('li');
        $li.id = key;
        $li.textContent = categoryTitle;
        $ul.appendChild($li);
    }
    return $ul;
}

/**
 * 카테고리 아이탬 만드는 함수
 * @param id uuid 를 채번해서 만듬
 * @param categoryItem 서버에서 등록했을 수 있는 카테고리 아이탬
 * @param categoryTitleMap 서버에서 등록한 카테고리 타이틀 map
 * @returns {HTMLDivElement} div 리턴
 */
function createCategoryItem(id, categoryItem, categoryTitleMap) {
    const $div = document.createElement("div");db_blog
    $div.className = "category__item";
    $div.id = id;
    $div.dataset.type = "add";
    $div.innerHTML = `
      <div class="left">
        <div class="icons">
          <div class="icon__block subtree"><span class="none"></span></div>
          <div class="icon__block drag"><span class="icon"></span></div>
        </div>
        <label><input class="ellipsis" type="text"></label>
        <div class="selected__title__box">
          <span class="selected__title"></span>
        </div>
        <div class="select__container">
          <button>
            <span class="select__menu__title">${categoryTitleMap.get(categoryItem.categoryTag)}</span>
            <span class="icon__dropdown"></span>
          </button>
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
    const $selectContainer = $div.querySelector('.select__container');
    const $ul = createCategoryTitle(categoryTitleMap);
    $selectContainer.appendChild($ul);
    return $div;
}


/*────────────────────────────────────
  api 호출 관련 함수
────────────────────────────────────*/
async function loadCategoryTitles() {
    try {
        return await apiFetch('/category-titles', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    } catch (e) {
        handleError(e, '카테고리 타이틀 로딩');
        return null;
    }
}

async function loadSectionAndSetTitle($mainSection, url, sectionTitle) {
    try {
        $mainSection.innerHTML = await apiFetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/html'
            }
        });
        const $title = document.querySelector('.category__container .title');
        if ($title) $title.textContent = sectionTitle;
    } catch (e) {
        handleError(e, '섹션 로딩');
    }
}

async function fetchCategoryMenus(categoryMap) {
    try {
        // 리스트 정보로 변환 .
        const categoryList = [...categoryMap.values()];
        if (!categoryMap) return;

        return await apiFetch('/categories', {
            method: 'PATCH',
            body: JSON.stringify(categoryList),
            headers: {
                ...getCsrfToken(),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    } catch (e) {
        handleError(e, '카테고리 전송 실패!');
        return null;
    }
}

function handleError(error, context = "") {
    alert(`[${context}] 에러 발생:`);
    console.error(`[${context}] 에러 발생:`, error);
    // TODO: 필요하면 location.href = "/error" 등 리다이렉트 처리
}


/*────────────────────────────────────
  ui 관련 함수
────────────────────────────────────*/
function childMenuItemDisabled($childDiv, isDisabled) {
    $childDiv.querySelector(".btn__add").style.display = isDisabled ? 'none' : 'block';              // 자식은 추가 버튼 없음
    $childDiv.querySelector('.select__container').style.display = isDisabled ? 'none' : 'block';                           // 자식은 주제 선택 없음
    $childDiv.querySelector('.selected__title__box').style.display = isDisabled ? 'none' : 'block';                        // 자식은 주제 선택 없음
    $childDiv.querySelector('.icon__block.subtree').style.display = isDisabled ? 'none' : 'block';
}

function changeItemDropIcon($element, icon, replaceIcon) {
    $element.classList.replace(icon, replaceIcon);
}

function isSameTitle(categoryMap, currentCategoryMenuItem) {
    for (let key in categoryMap) {
        const categoryMenuItem = categoryMap[key];
        if (categoryMenuItem.id === currentCategoryMenuItem.id) {
            continue;
        }
        if (categoryMenuItem.categoryTitle === currentCategoryMenuItem.categoryTitle) {
            return false;
        }
    }
    return true;
}

/*────────────────────────────────────
  event
────────────────────────────────────*/
document.addEventListener("DOMContentLoaded", function () {
    const categoryMap = new Map();
    const $mainSection = document.querySelector('.container .main__section');
    const categoryTitleMap = new Map();
    
    window.addEventListener('sideMenuClick', async function (ev) {
        const {section_title, url} = ev.detail;
        // 카테고리 메뉴 초기화
        const responseCategoryTitles = await loadCategoryTitles();
        if (responseCategoryTitles?.data) {
            for (let key in responseCategoryTitles.data) {
                const item = responseCategoryTitles.data[key];
                categoryTitleMap.set(item.no, item.title);
            }
        }
        await loadSectionAndSetTitle($mainSection, url, section_title);
    });
    
    document.addEventListener("click", async function (event) {
        const $target = event.target;
        
        // root 에서 추가 버튼 누를시 동작
        if ($target.closest('.category__root .btns__default button') || $target.closest('.category__bottom__add')) {
            const type = $target.dataset.type;
            if (type !== "add") return;
            const id = generateUUID();
            const item = new CategoryMenuItem(id);
            categoryMap.set(id, item);
            
            const $div = createCategoryItem(id, item, categoryTitleMap);
            document.querySelector(".category__controller").appendChild($div);
        }
        
        // 자식 관련된 추가 삭제
        if ($target.closest(".btn__add")) {
            const $div = $target.closest(".category__item");
            if (!$div) return;
            // data 매핑
            const parentId = $div.id;
            const id = generateUUID();
            const childItem = new CategoryMenuItem(id, parentId);
            categoryMap.set(id, childItem);
            
            const $childDiv = createCategoryItem(id, childItem, categoryTitleMap);
            childMenuItemDisabled($childDiv, true);
            
            // 형제 요소를 만들고 자식을 삽임
            const next = $div.nextElementSibling;
            const isContainer = next ? next.classList.contains('child__container') : false;
            let $childContainer;
            if (!isContainer) {
                $childContainer = document.createElement('div');
                $childContainer.className = 'child__container';
                $childContainer.style.marginLeft = '50px';
                $div.insertAdjacentElement("afterend", $childContainer);
            }
            $childContainer = $div.nextElementSibling;
            $childContainer.appendChild($childDiv);
            $childContainer.style.display = 'block';
            
            // 추가시 arrow icon 추가
            const $span = $div.querySelector('.icon__block.subtree span');
            const $iconBlock = $span.closest('.icon__block.subtree');
            $iconBlock.classList.add('active');
            // 마지막 아이탬 포커스 추가
            
            $childContainer.querySelector('.child__container .category__item:last-child input[type="text"]').focus();
            changeItemDropIcon($span, 'none', 'arrow_icon');
        }
        
        if ($target.closest(".btn__edit")) {
            const $div = $target.closest(".category__item");
            const $input = $div.querySelector("input[type='text']");
            const $btnConfirm = $div.querySelector(".btn__confirm");
            
            $div.dataset.type = "edit";
            $input.disabled = false;
            $btnConfirm.disabled = true;
        }
        
        if ($target.closest(".btn__delete")) {
            const $div = $target.closest(".category__item");
            if (!$div) return;
            const parentId = categoryMap.get($div.id).parentId;
            if (parentId) {  // 자식 아이탬인 경우
                // 부모 element 를 가지고 와서
                const $parentElement = document.getElementById(parentId);
                const $childContainer = $div.closest('.child__container');
                categoryMap.delete($div.id);
                $div.remove();
                
                // 자식 아이탬이 없을 경우 icon 변경
                if ($childContainer.children.length <= 0) {
                    // 부모 아이탬이 있을 경우에 자식 하나씩 삭제시 icon 을 none 으로 변경해야한다.
                    const $span = $parentElement.querySelector('.icon__block.subtree span');
                    changeItemDropIcon($span, 'arrow_icon', 'none');
                }
                return;
            }
            
            // 부모 일경우 자식들을 찾아서 하나씩 지워줘야 한다.
            const $next = $div.nextElementSibling;
            if (!$next || !$next.classList.contains('.child__container')) {
                $div.remove();
                return;
            }
            // 컨테이너 아래 자식 들 모두 삭제
            $next.querySelectorAll('.child__container > .category__item').forEach(($childItem) => {
                categoryMap.delete($childItem.id);
                $childItem.remove();
            })
            $next.remove();
            $div.remove();
            categoryMap.delete($div.id);
        }
        
        if ($target.closest(".btn__cancel")) {
            const $div = $target.closest(".category__item");
            const $input = $div.querySelector("input[type='text']");
            const parentId = categoryMap[$div.id]?.parentId;
            const $childContainer = $div.closest('.child__container');
            
            // 자식일 경우 그냥 자기자신을 지우면된다.
            if ($div.dataset.type === "add") {
                $div.remove();
                categoryMap.delete($div.id);
            } else {
                // confirm 상태일 경우 삭제하면 안되니까 return 해야된다.
                $div.dataset.type = "confirm";
                $input.disabled = true;
                return;
            }
            // 부모아이디가 잇는 경우만 취소시 아이콘 변경
            if (!parentId) return;
            
            // 컨테이너의 자식이 존재하지 부모의 아이콘을 변경해준다.
            const $parentElement = document.getElementById(parentId);
            if ($childContainer.children.length <= 0) {
                const $span = $parentElement.querySelector('.icon__block.subtree span');
                changeItemDropIcon($span, 'arrow_icon', 'none');
            }
        }
        
        if ($target.closest(".btn__confirm")) {
            const $div = $target.closest(".category__item");
            const item = categoryMap.get($div.id);
            const $input = $div.querySelector("input[type='text']");
            const $selectedBox = $div.querySelector(".selected__title");
            
            if (!item.categoryTitle.trim()) return;
            // 같은 타이틀 제목이 있는 경우 확인을 못누르게 막는다.
            if (!isSameTitle(categoryMap, item)) {
                alert('같은 타이틀 제목이 존재합니다.');
                $input?.focus();
                return;
            }
            $div.dataset.type = "confirm";
            // 자식 노드는 selectedBox 없음
            if ($selectedBox) $selectedBox.textContent = categoryTitleMap.get(item.categoryTag);
            $input.disabled = true;
        }
        
        // 아이콘 클릭시 발동
        if ($target.closest('.icon__block.subtree')) {
            const $iconBlock = $target.closest('.icon__block.subtree');
            let $span = $target.closest('span');
            // 부모요소 클릭시 초기화
            if (!$span) $span = $iconBlock.querySelector('span');
            
            if ($span.className === 'none') return;
            // 접기 버튼 활성화 시 child item 모두 접음
            const $parentElement = $iconBlock.closest('.category__item');
            const $childContainer = $parentElement.nextElementSibling;
            // 컨테이너 존재하지 않을 경우 리턴
            if (!$childContainer || !$childContainer.classList.contains('child__container')) return;
            
            if (!$iconBlock.classList.contains('active')) {   // 펼치기
                $iconBlock.classList.add('active');
                $childContainer.style.display = 'block';
                $childContainer.querySelector('.child__container .category__item:last-child input[type="text"]').focus();
            } else {                                        // 접기
                $iconBlock.classList.remove('active');
                $childContainer.style.display = 'none';
            }
        }
        
        if ($target.closest(".select__container button")) {
            const $container = $target.closest(".select__container");
            $container.classList.toggle("active");
        }
        
        if ($target.closest(".select__menus li")) {
            const $div = $target.closest(".category__item");
            const $container = $div.querySelector(".select__container");
            const $title = $container.querySelector(".select__menu__title");
            const tag = Number($target.id);  // 태그값을 가지고옴.
            categoryMap.get($div.id).updateTag(tag);
            if (categoryTitleMap.get(tag)) {
                $title.textContent = categoryTitleMap.get(tag);
            }
            $container.classList.remove("active");
        }
        
        // 변경사항 저장
        if ($target.closest('.btn__save')) {
            // 저장성공했는지 확인한다.
            const response = await fetchCategoryMenus(categoryMap);
            if(!response.success) return;
            
            // todo 저장성공 했다면 새로 html 값을 가져와서 바인딩 한다.
            
        }
    });
    
    document.addEventListener("input", function (event) {
        const $input = event.target;
        if (!$input.matches("input[type='text']")) return;
        
        const $div = $input.closest(".category__item");
        const $btnConfirm = $div.querySelector(".btn__confirm");
        const text = $input.value.trim();
        
        categoryMap.get($div.id).updateTitle(text);
        $btnConfirm.disabled = !text;
    });
});

