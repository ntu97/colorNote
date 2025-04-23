/**
 * 应用主入口
 * 负责初始化和协调各个模块
 */
class NoteApp {
    constructor() {
        // 初始化完成标志
        this.initialized = false;
        
        // 初始化应用
        this.init();
    }

    /**
     * 初始化应用
     */
    async init() {
        try {
            // 等待数据库初始化完成
            await db.getDB();
            
            // 初始化笔记管理器
            this.noteManager = new NoteManager(db);
            
            // 初始化统计管理器
            this.statisticsManager = new StatisticsManager(db);
            
            // 标记初始化完成
            this.initialized = true;
            console.log('应用初始化完成');
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.showToast('应用初始化失败，请刷新页面重试');
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
}

// 创建应用实例
const app = new NoteApp();