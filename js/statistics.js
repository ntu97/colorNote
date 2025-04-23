/**
 * 统计模块
 * 负责笔记的统计信息展示
 */
class StatisticsManager {
    constructor(database) {
        this.db = database;
        
        // 获取DOM元素
        this.statsButton = document.getElementById('statistics-btn');
        this.statsPanel = document.getElementById('statistics-panel');
        this.closeStatsButton = document.getElementById('close-stats');
        
        // 统计数据元素
        this.totalNotesElement = document.getElementById('total-notes');
        this.highPriorityElement = document.getElementById('high-priority');
        this.mediumPriorityElement = document.getElementById('medium-priority');
        this.lowPriorityElement = document.getElementById('low-priority');
        this.weeklyNotesElement = document.getElementById('weekly-notes');
        
        // 初始化事件监听
        this.initEventListeners();
    }

    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        // 统计按钮点击
        this.statsButton.addEventListener('click', () => this.showStatistics());
        
        // 关闭统计面板按钮
        this.closeStatsButton.addEventListener('click', () => this.hideStatistics());
    }

    /**
     * 显示统计信息
     */
    async showStatistics() {
        try {
            // 获取笔记统计信息
            const stats = await this.db.getNoteStats();
            
            // 更新统计面板
            this.totalNotesElement.textContent = stats.total;
            this.highPriorityElement.textContent = stats.red;
            this.mediumPriorityElement.textContent = stats.yellow;
            this.lowPriorityElement.textContent = stats.blue;
            this.weeklyNotesElement.textContent = stats.weeklyNew;
            
            // 显示统计面板
            this.statsPanel.classList.remove('hidden');
        } catch (error) {
            console.error('获取统计信息失败:', error);
            this.showToast('获取统计信息失败');
        }
    }

    /**
     * 隐藏统计面板
     */
    hideStatistics() {
        this.statsPanel.classList.add('hidden');
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

// 将在app.js中实例化