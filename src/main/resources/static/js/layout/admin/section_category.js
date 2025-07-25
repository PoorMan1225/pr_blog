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
        this.status = 'add';            // edit, add, delete, default
        this.orderNo = 0;
        this.children = [];
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

function addChildItem(categoryMap, parentId) {
    const parentCategoryItem = categoryMap.get(parentId);
    if (!parentCategoryItem) return false;
    
    const childItem = new CategoryMenuItem(generateUUID(), parentId);
    childItem.orderNo = parentCategoryItem.children.length;
    parentCategoryItem.children.push(childItem);
    // 데이터 동기화
    categoryMap.set(childItem.id, childItem);
    return childItem;
}

function removeChildItem(categoryMap, parentId, childId) {
    const parentCategoryItem = categoryMap.get(parentId);
    if (!parentCategoryItem) return false;
    
    const index = parentCategoryItem.children.findIndex(item => item.id === childId);
    if (index === -1) return false;
    
    parentCategoryItem.children.splice(index, 1);
    reOrder(parentCategoryItem.children);
    // 데이터 동기화
    categoryMap.delete(childId);
    return true;
}

function reOrder(items) {
    items.forEach((item, index) => {
        item.orderNo = index;
    });
}

function reassignParentOrder(categoryMap) {
    const parents = [...categoryMap.values()]
        .filter(item => item.parentId === null)
        .sort((a, b) => a.orderNo - b.orderNo); // 혹시 순서 꼬였을 경우 대비
    
    parents.forEach((item, index) => {
        item.orderNo = index;
    });
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
function createCategoryItem(categoryItem, categoryTitleMap) {
    const $div = document.createElement("div");
    $div.className = "category__item";
    $div.id = categoryItem.id;
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
            <span id="${categoryItem.categoryTag}"
                  class="select__menu__title">${categoryTitleMap.get(categoryItem.categoryTag)}</span>
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
        const categoryList = [...categoryMap.values()].filter((item) => item.parentId === null);
        console.log(categoryList);
        if (!categoryMap || !categoryList || categoryList.length <= 0) return null;
        
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

function isSameTitle(categoryMap, $input) {
    if(!$input) return false;
    return categoryMap.values().some((item) => item.categoryTitle.trim() === $input.value.trim());
}

/*────────────────────────────────────
  event
────────────────────────────────────*/
document.addEventListener("DOMContentLoaded", function () {
    const categoryMap = new Map();
    const categoryTitleMap = new Map();
    const categoryParentList = [];
    const $mainSection = document.querySelector('.container .main__section');
    
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
            const makeItem = new CategoryMenuItem(generateUUID());
            // orderNo 부여
            makeItem.orderNo = [...categoryMap.values()].filter(item => item.parentId === null).length;
            // 부모 아이디 매핑
            categoryMap.set(makeItem.id, makeItem);
            const $div = createCategoryItem(makeItem, categoryTitleMap);
            document.querySelector(".category__controller").appendChild($div);
            console.log(categoryMap);
        }
        
        // 자식 관련된 추가 삭제
        if ($target.closest(".btn__add")) {
            const $element = $target.closest(".category__item");
            if (!$element) return;
            
            const childItem = addChildItem(categoryMap, $element.id);
            if (!childItem) return;
            
            // 자식 아이탬을 만듬
            const $childDiv = createCategoryItem(childItem, categoryTitleMap);
            childMenuItemDisabled($childDiv, true);
            
            // 형제 요소를 만들고 자식을 삽임
            const next = $element.nextElementSibling;
            const isContainer = next ? next.classList.contains('child__container') : false;
            let $childContainer;
            // 컨테이너 요소 생성
            if (!isContainer) {
                $childContainer = document.createElement('div');
                $childContainer.className = 'child__container';
                $childContainer.style.marginLeft = '50px';
                $element.insertAdjacentElement("afterend", $childContainer);
            }
            $childContainer = $element.nextElementSibling;
            $childContainer.appendChild($childDiv);
            $childContainer.style.display = 'block';
            
            // 추가시 arrow icon 추가
            const $span = $element.querySelector('.icon__block.subtree span');
            const $iconBlock = $span.closest('.icon__block.subtree');
            $iconBlock.classList.add('active');
            
            // 마지막 아이탬 포커스 추가
            $childContainer.querySelector('.child__container .category__item:last-child input[type="text"]').focus();
            changeItemDropIcon($span, 'none', 'arrow_icon');
            console.log(categoryMap);
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
            const $element = $target.closest(".category__item");
            if (!$element) return;
            const parentId = categoryMap.get($element.id).parentId;
            if (parentId) {  // 자식 아이탬인 경우
                // 부모 element 를 가지고 와서
                const $parentElement = document.getElementById(parentId);
                const $childContainer = $element.closest('.child__container');
                const parentChildItem = categoryMap.get(parentId);
                
                // 자식 아이탬 삭제
                if (!removeChildItem(categoryMap, parentId, $element.id)) return;
                $element.remove();
                
                // 자식 아이탬이 없을 경우 icon 변경
                if ($childContainer.children.length <= 0) {
                    // 부모 아이탬이 있을 경우에 자식 하나씩 삭제시 icon 을 none 으로 변경해야한다.
                    const $span = $parentElement.querySelector('.icon__block.subtree span');
                    changeItemDropIcon($span, 'arrow_icon', 'none');
                }
                return;
            }
            
            // 부모 일경우 자식들을 찾아서 하나씩 지워줘야 한다.
            const $next = $element.nextElementSibling;
            if (!$next || !$next.classList.contains('child__container')) {
                $element.remove();
                return;
            }
            // 컨테이너 아래 자식 들 모두 삭제
            $next.querySelectorAll('.child__container > .category__item').forEach(($childItem) => {
                removeChildItem(categoryMap, parentId, $childItem.id);
                $childItem.remove();
            })
            $next.remove();
            $element.remove();
            categoryMap.delete($element.id);
            // 다시 재정렬
            reassignParentOrder(categoryMap);
        }
        
        if ($target.closest(".btn__cancel")) {
            const $div = $target.closest(".category__item");
            const $input = $div.querySelector("input[type='text']");
            const parentId = categoryMap.get($div.id)?.parentId;
            const $childContainer = $div.closest('.child__container');
            const $selectMenuTitle = $div.querySelector('.select__menu__title');
            const item = categoryMap.get($div.id);
            
            // 자식일 경우 그냥 자기자신을 지우면된다.
            if ($div.dataset.type === "add") {
                if (parentId) {
                    $div.remove();
                    removeChildItem(categoryMap, parentId, $div.id);
                } else {
                    $div.remove();
                    categoryMap.delete($div.id);
                    // 다시 재정렬
                    reassignParentOrder(categoryMap);
                    // 컨테이너의 자식이 존재하지 부모의 아이콘을 변경해준다.
                    const $parentElement = document.getElementById(parentId);
                    if ($childContainer.children.length <= 0) {
                        const $span = $parentElement.querySelector('.icon__block.subtree span');
                        changeItemDropIcon($span, 'arrow_icon', 'none');
                    }
                }
            }
            // edit 상태일 경우 취소를 누르면 confirm 상태로 돌아가야 한다. ui 업데이트
            if ($div.dataset.type === "edit") {
                $div.dataset.type = "confirm";
                $input.value = item.categoryTitle;
                $selectMenuTitle.id = String(item.categoryTag);
                $selectMenuTitle.textContent = categoryTitleMap.get(item.categoryTag);
                $input.disabled = true;
                return;
            }
        }
        
        if ($target.closest(".btn__confirm")) {
            const $div = $target.closest(".category__item");
            const item = categoryMap.get($div.id);
            const $input = $div.querySelector("input[type='text']");
            const $selectedBox = $div.querySelector(".selected__title");
            const $selectedMenuTitle = $div.querySelector(".select__menu__title");
            
            if(isSameTitle(categoryMap, $input)) {
                alert('같은 타이틀 제목이 존재합니다.');
                $input?.focus();
                return;
            }
            
            // data 업데이트
            item.updateTitle($input.value.trim());
            item.updateTag(Number($selectedMenuTitle.id));
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
            // 선택된 아이디로 변경
            const $title = $container.querySelector(".select__menu__title");
            $title.id = $target.id;
            
            const tag = Number($target.id);  // 태그값을 가지고옴.
            if (categoryTitleMap.get(tag)) {
                $title.textContent = categoryTitleMap.get(tag);
            }
            $container.classList.remove("active");
        }
        
        // 변경사항 저장
        if ($target.closest('.btn__save')) {
            // 저장성공했는지 확인한다.
            const response = await fetchCategoryMenus(categoryMap);
            console.log(response);
            // if (!response.success) return;
            
            // todo 저장성공 했다면 새로 html 값을 가져와서 바인딩 한다.
            
        }
    });
    
    document.addEventListener("input", function (event) {
        const $input = event.target;
        if (!$input.matches("input[type='text']")) return;
        
        const $div = $input.closest(".category__item");
        const $btnConfirm = $div.querySelector(".btn__confirm");
        const text = $input.value.trim();
        $btnConfirm.disabled = !text;
    });
});

