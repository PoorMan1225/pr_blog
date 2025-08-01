import {apiFetch} from "../utils/api.js";
import generateUUID from "../utils/uuid.js";

/*────────────────────────────────────
  select menus
────────────────────────────────────*/

class Menus {
    constructor(response) {
        // initElement
        this.initElement();
        // initEvent
        this.initEvent();
        // 데이터 찾기
        this.map = new Map();
        this.initData(response.data);
        this.selectedMenuItem = null;
    }
    
    initElement() {
        this.$btnMenus = document.querySelector('.btn__menus');
        this.$selectWrapper = document.querySelector('.select__menu__wrapper');
        this.$selectMenus = this.$selectWrapper.querySelector('.select__menus');
    }
    
    initEvent() {
        // 이벤트 등록할때  this 가 btnMenus 가 됨으로 화살표함수로 변경 또는 바인드 사용
        this.$btnMenus.addEventListener('click', this.onBtnClick.bind(this));
        document.addEventListener('click', this.onDocumentClick.bind(this));
    }
    
    initData(data) {
        // 1. empty 카테고리 추가
        const emptyId = generateUUID();
        const emptyMenu = new MenuItem(emptyId, 0, 0, '카테고리');
        emptyMenu.setOnMenuItemClick(this.onChildMenuItemClick.bind(this));
        this.map.set(emptyId, emptyMenu);
        this.appendElement(emptyMenu);
        
        // 2. 실제 데이터 추가 (재귀적으로)
        data.forEach((item) => {
            this.addMenuItemRecursive(item, 0); // 시작 level = 0
        });
    }
    
    addMenuItemRecursive(item, level) {
        const id = generateUUID();
        const menuItem = new MenuItem(id, level, item.serverId, item.categoryTitle);
        menuItem.setOnMenuItemClick(this.onChildMenuItemClick.bind(this));
        this.map.set(id, menuItem);
        this.appendElement(menuItem);
        
        if (item.children && item.children.length > 0) {
            item.children.forEach(child => {
                this.addMenuItemRecursive(child, level + 1);
            });
        }
    }
    
    onChildMenuItemClick(ev, id) {
        // active menu 를 close 한다.
        this.toggleMenuActive();
        // 현재 버튼에다가 text 를 변경해준다.
        this.selectedMenuItem = this.map.get(id);
        // text 를 변경해준다.
        if(this.selectedMenuItem) {
            this.$btnMenus.textContent = this.selectedMenuItem.categoryTitle;
        }
    }
    
    onDocumentClick(ev) {
        // 메뉴 DOM 요소 바깥을 클릭했는지 확인
        if (!ev.target.closest('.btn__menus') && !this.$selectWrapper.contains(ev.target)) {
            this.$selectWrapper.classList.remove('active');
        }
    }
    
    appendElement(menuItem) {
        // li 만들고 붙이기
        const $li = menuItem.getElement();
        this.$selectMenus.appendChild($li);
    }
    
    toggleMenuActive() {
        if (!this.$selectWrapper.classList.contains('active')) {
            this.$selectWrapper.classList.add('active');
        } else {
            this.$selectWrapper.classList.remove('active');
        }
    }
    
    onBtnClick(ev) {
        this.toggleMenuActive();
    }
}

class MenuItem {
    constructor(id, level, serverId, categoryTitle) {
        this.id = id;
        this.level = level;
        this.serverId = serverId;
        this.categoryTitle = categoryTitle;
        this.el = this.createMenuItem();
        
        this.onMenuItemClick = null;
        this.initEvent();
    }
    
    initEvent() {
        this.el.addEventListener('click', (ev) => {
            ev.stopPropagation();
            if (this.onMenuItemClick) {
                this.onMenuItemClick(ev, this.id);
            }
        });
    }
    
    getElement() {
        return this.el;
    }
    
    setOnMenuItemClick(event) {
        this.onMenuItemClick = event;
    }
    
    // li 를 만들어서 붙인다.
    createMenuItem() {
        const $li = document.createElement('li');
        $li.id = this.id;
        // 계층 표현용 prefix 생성
        const prefix = this.level > 0 ? '- '.repeat(this.level) : '';
        $li.innerHTML = `<span>${prefix}${this.categoryTitle}</span>`;
        return $li;
    }
}

/*────────────────────────────────────
  entries 게시글 관련
────────────────────────────────────*/

class Entry {

}

class EntryTitle {
    constructor() {
        this.initElement();
        this.initEvent();
    }
    
    initElement() {
        this.$textArea = document.querySelector('.auto-height-textarea');
        this.adjustHeight();
    }
    
    initEvent() {
        this.$textArea.addEventListener('keydown', this.onKeyDown.bind(this));
        this.$textArea.addEventListener('input', this.onTitleChanged.bind(this));
    }
    
    onKeyDown(ev) {
        if (ev.key === 'Enter') {
            ev.preventDefault();
        }
    }
    
    onTitleChanged(ev) {
        // 엔터 입력 방지
        if (ev.inputType === 'insertLineBreak') {
            ev.preventDefault();
            return;
        }
        this.adjustHeight();
    }
    
    adjustHeight() {
        this.$textArea.style.height = 'auto';               // 높이 초기화 (스크롤 높이 측정 위해)
        this.$textArea.style.height = this.$textArea.scrollHeight + 'px';  // 내용 높이에 맞게 조절
    }
}

/*────────────────────────────────────
  api 호출 관련 함수
────────────────────────────────────*/

async function getAllCategories() {
    try {
        return await apiFetch('/categories', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
    } catch (e) {
        alert('카테고리 메뉴 가져오기 실패!');
        return null;
    }
}
// entries.js (module)
const EditorJS = window.EditorJS;  // 전역 객체를 명시적으로 가져오기
const InlineImage = window.InlineImage;
const Header = window.Header;
const EditorjsList  = window.EditorjsList;
const Quote = window.Quote;
const editorjsCodeflask  = window.editorjsCodeflask ;

document.addEventListener('DOMContentLoaded', async function () {
    /* menus 초기화 */
    const menuResponse = await getAllCategories();
    const menus = new Menus(menuResponse);
    const entry = new EntryTitle();
    
    const editor = new EditorJS({
        tools: {
            header: {
                class: Header,
                inlineToolbar: true
            },
            list: {
                class: EditorjsList,
                inlineToolbar: true,
                config: {
                    defaultStyle: 'unordered'
                },
            },
            code : editorjsCodeflask,
            image: {
                class: InlineImage,
                inlineToolbar: true,
                config: {
                    embed: {
                        display: true,
                    },
                    unsplash: {
                        appName: 'my-little-blog',
                        apiUrl: 'http://localhost:8080/unsplash',
                        maxResults: 30,
                        imageParams: {
                            q:85,
                            w:1500,
                        }
                    }
                }
            }
        }
    });
});