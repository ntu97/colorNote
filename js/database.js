/**
 * 数据库操作模块
 * 负责笔记的本地存储和检索
 */
class NoteDatabase {
    constructor() {
        this.dbName = 'noteAppDB';
        this.notesStoreName = 'notes';
        this.db = null;
        this.initDB();
    }

    /**
     * 初始化IndexedDB数据库
     */
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 如果存储对象不存在，则创建它
                if (!db.objectStoreNames.contains(this.notesStoreName)) {
                    const notesStore = db.createObjectStore(this.notesStoreName, { keyPath: 'id' });
                    notesStore.createIndex('timestamp', 'timestamp', { unique: false });
                    notesStore.createIndex('priority', 'priority', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('数据库初始化成功');
                resolve();
            };

            request.onerror = (event) => {
                console.error('数据库初始化失败:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * 获取数据库连接
     */
    async getDB() {
        if (this.db) return this.db;
        
        // 如果数据库未初始化，则等待初始化完成
        await this.initDB();
        return this.db;
    }

    /**
     * 添加或更新笔记
     * @param {Object} note 笔记对象
     */
    async saveNote(note) {
        const db = await this.getDB();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.notesStoreName], 'readwrite');
            const store = transaction.objectStore(this.notesStoreName);
            
            // 确保笔记有ID，如果没有则生成
            if (!note.id) {
                note.id = Date.now().toString();
                note.timestamp = Date.now();
            } else if (!note.timestamp) {
                note.timestamp = Date.now();
            }
            
            const request = store.put(note);
            
            request.onsuccess = () => {
                resolve(note);
            };
            
            request.onerror = (event) => {
                console.error('保存笔记失败:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * 根据ID获取笔记
     * @param {string} id 笔记ID
     */
    async getNoteById(id) {
        const db = await this.getDB();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.notesStoreName], 'readonly');
            const store = transaction.objectStore(this.notesStoreName);
            const request = store.get(id);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = (event) => {
                console.error('获取笔记失败:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * 获取所有笔记
     */
    async getAllNotes() {
        const db = await this.getDB();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.notesStoreName], 'readonly');
            const store = transaction.objectStore(this.notesStoreName);
            const request = store.getAll();
            
            request.onsuccess = () => {
                // 按时间戳降序排序（最新的在前面）
                const notes = request.result.sort((a, b) => b.timestamp - a.timestamp);
                resolve(notes);
            };
            
            request.onerror = (event) => {
                console.error('获取所有笔记失败:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * 删除笔记
     * @param {string} id 笔记ID
     */
    async deleteNote(id) {
        const db = await this.getDB();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.notesStoreName], 'readwrite');
            const store = transaction.objectStore(this.notesStoreName);
            const request = store.delete(id);
            
            request.onsuccess = () => {
                resolve(true);
            };
            
            request.onerror = (event) => {
                console.error('删除笔记失败:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * 获取按优先级分类的笔记数量
     */
    async getNoteStats() {
        const notes = await this.getAllNotes();
        
        // 一周的毫秒数：7 * 24 * 60 * 60 * 1000
        const oneWeekAgo = Date.now() - 604800000;
        
        // 按优先级统计
        const stats = {
            total: notes.length,
            red: 0,
            yellow: 0,
            blue: 0,
            weeklyNew: 0
        };
        
        notes.forEach(note => {
            if (note.priority === 'red') stats.red++;
            else if (note.priority === 'yellow') stats.yellow++;
            else if (note.priority === 'blue') stats.blue++;
            
            if (note.timestamp > oneWeekAgo) {
                stats.weeklyNew++;
            }
        });
        
        return stats;
    }
}

// 创建数据库实例
const db = new NoteDatabase();