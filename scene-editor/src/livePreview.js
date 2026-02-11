class LivePreview {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.renderQueue = [];
    this.isRendering = false;
    this.fps = 60;
    this.lastRenderTime = 0;

    // 启动渲染循环
    this.startRenderLoop();
  }

  // 添加渲染任务
  addToRenderQueue(renderTask) {
    this.renderQueue.push(renderTask);
  }

  // 清除渲染队列
  clearRenderQueue() {
    this.renderQueue = [];
  }

  // 渲染循环
  startRenderLoop() {
    const render = (timestamp) => {
      if (timestamp - this.lastRenderTime >= 1000 / this.fps) {
        this.lastRenderTime = timestamp;
        
        if (this.renderQueue.length > 0 && !this.isRendering) {
          this.isRendering = true;
          const task = this.renderQueue.shift();
          
          try {
            task(this.ctx);
          } catch (error) {
            console.error('Render task failed:', error);
          }
          
          this.isRendering = false;
        }
      }
      
      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }

  // 设置FPS
  setFPS(fps) {
    this.fps = Math.max(1, Math.min(144, fps));
  }

  // 清空画布
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

module.exports = LivePreview;