/**
 * 笔记操作模块
 * 负责处理笔记的创建、编辑、删除和显示
 */
class NoteManager {
    constructor(database) {
        this.db = database;
        this.currentNote = null;
        this.editMode = false;
        
        // 获取DOM元素
        this.notesContainer = document.getElementById('notes-container');
        this.editor = document.getElementById('editor');
        this.titleInput = document.getElementById('note-title');
        this.contentInput = document.getElementById('note-content');
        this.saveButton = document.getElementById('save-note');
        this.cancelButton = document.getElementById('cancel-edit');
        this.addNoteButton = document.getElementById('add-note-btn');
        this.priorityButtons = document.querySelectorAll('.priority-btn');
        
        // 初始化事件监听
        this.initEventListeners();
        
        // 加载所有笔记
        this.loadNotes();
    }

    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        // 添加笔记按钮
        this.addNoteButton.addEventListener('click', () => this.showEditor());
        
        // 保存笔记按钮
        this.saveButton.addEventListener('click', () => this.saveNote());
        
        // 取消编辑按钮
        this.cancelButton.addEventListener('click', () => this.hideEditor());
        
        // 优先级按钮点击
        this.priorityButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.priorityButtons.forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });
    }

    /**
     * 加载所有笔记并显示
     */
    async loadNotes() {
        try {
            const notes = await this.db.getAllNotes();
            this.renderNotes(notes);
        } catch (error) {
            console.error('加载笔记失败:', error);
            this.showToast('加载笔记失败');
        }
    }

    /**
     * 渲染笔记列表
     * @param {Array} notes 笔记数组
     */
    renderNotes(notes) {
        this.notesContainer.innerHTML = '';
        
        if (notes.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = '暂无笔记，点击右上角"新建"按钮添加';
            this.notesContainer.appendChild(emptyMessage);
            return;
        }
        
        notes.forEach(note => {
            const noteElement = this.createNoteElement(note);
            this.notesContainer.appendChild(noteElement);
        });
    }

    /**
     * 创建笔记元素
     * @param {Object} note 笔记对象
     * @returns {HTMLElement} 笔记元素
     */
    createNoteElement(note) {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        noteCard.dataset.id = note.id;
        noteCard.dataset.priority = note.priority || 'blue';
        
        const date = new Date(note.timestamp);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        noteCard.innerHTML = `
            <h3 class="note-title">${this.escapeHtml(note.title)}</h3>
            <div class="note-content">${this.escapeHtml(note.content)}</div>
            <div class="note-date">${formattedDate}</div>
            <div class="note-actions">
                <button class="action-btn edit-btn">编辑</button>
                <button class="action-btn delete-btn">删除</button>
            </div>
        `;
        
        // 添加事件监听
        noteCard.querySelector('.edit-btn').addEventListener('click', () => {
            this.editNote(note.id);
        });
        
        noteCard.querySelector('.delete-btn').addEventListener('click', () => {
            this.deleteNote(note.id);
        });
        
        return noteCard;
    }

    /**
     * 显示编辑器
     * @param {Object} note 笔记对象（如果是编辑模式）
     */
    showEditor(note = null) {
        this.editMode = !!note;
        this.currentNote = note;
        
        // 重置表单
        this.titleInput.value = note ? note.title : '';
        this.contentInput.value = note ? note.content : '';
        
        // 重置优先级选择
        this.priorityButtons.forEach(btn => btn.classList.remove('selected'));
        if (note && note.priority) {
            const selectedBtn = Array.from(this.priorityButtons).find(
                btn => btn.dataset.priority === note.priority
            );
            if (selectedBtn) selectedBtn.classList.add('selected');
        } else {
            // 默认选择蓝色（低优先级）
            this.priorityButtons[2].classList.add('selected');
        }
        
        // 显示编辑器，隐藏笔记列表
        this.editor.classList.remove('hidden');
        this.notesContainer.classList.add('hidden');
        
        // 聚焦标题输入框
        setTimeout(() => this.titleInput.focus(), 0);
    }

    /**
     * 隐藏编辑器
     */
    hideEditor() {
        this.editor.classList.add('hidden');
        this.notesContainer.classList.remove('hidden');
        this.currentNote = null;
        this.editMode = false;
    }

    /**
     * 保存笔记
     */
    async saveNote() {
        const title = this.titleInput.value.trim();
        const content = this.contentInput.value.trim();
        
        if (!title) {
            this.showToast('请输入标题');
            return;
        }
        
        // 获取选中的优先级
        const selectedPriority = document.querySelector('.priority-btn.selected');
        const priority = selectedPriority ? selectedPriority.dataset.priority : 'blue';
        
        try {
            let note;
            
            if (this.editMode && this.currentNote) {
                // 更新笔记
                note = {
                    ...this.currentNote,
                    title,
                    content,
                    priority,
                    updatedAt: Date.now()
                };
            } else {
                // 创建新笔记
                note = {
                    id: Date.now().toString(),
                    title,
                    content,
                    priority,
                    timestamp: Date.now()
                };
            }
            
            await this.db.saveNote(note);
            this.hideEditor();
            this.loadNotes();
            this.showToast(this.editMode ? '笔记已更新' : '笔记已保存');
        } catch (error) {
            console.error('保存笔记失败:', error);
            this.showToast('保存笔记失败');
        }
    }

    /**
     * 编辑笔记
     * @param {string} id 笔记ID
     */
    async editNote(id) {
        try {
            const note = await this.db.getNoteById(id);
            if (note) {
                this.showEditor(note);
            } else {
                this.showToast('找不到该笔记');
            }
        } catch (error) {
            console.error('编辑笔记失败:', error);
            this.showToast('编辑笔记失败');
        }
    }

    /**
     * 删除笔记
     * @param {string} id 笔记ID
     */
    async deleteNote(id) {
        if (confirm('确定要删除这条笔记吗？')) {
            try {
                await this.db.deleteNote(id);
                this.loadNotes();
                this.showToast('笔记已删除');
            } catch (error) {
                console.error('删除笔记失败:', error);
                this.showToast('删除笔记失败');
            }
        }
    }

    /**
     * 显示消息提示
     * @param {string} message 消息内容
     */
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    /**
     * HTML转义，防止XSS攻击
     * @param {string} html HTML字符串
     * @returns {string} 转义后的字符串
     */
    escapeHtml(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }
}

// 将在app.js中实例化