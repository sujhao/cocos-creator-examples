// author: http://lamyoung.com/

// api: https://docs.cocos.com/creator/manual/zh/extension/api/editor-framework/renderer/gizmo.html

class PointsPolygonGizmo extends Editor.Gizmo {
  init() {
    // 初始化一些参数
  }

  onCreateMoveCallbacks() {
    // 创建 gizmo 操作回调

    // 申明一些局部变量
    let start_vertex;        // 按下鼠标时记录的位置
    let pressx, pressy;     // 按下鼠标时记录的鼠标位置

    return {
      /**
       * 在 gizmo 上按下鼠标时触发
       * @param x 按下点的 x 坐标
       * @param y 按下点的 y 坐标
       * @param event mousedown dom event
       */
      start: (x, y, event) => {
        start_vertex = null;
        pressx = x;
        pressy = y;
      },

      /**
       * 在 gizmo 上按下鼠标移动时触发
       * @param dx 鼠标移动的 x 位移
       * @param dy 鼠标移动的 y 位移
       * @param event mousedown dom event
       */
      update: (dx, dy, event, i) => {
        // 获取 gizmo 依附的组件
        let target = this.target;
        if (!start_vertex) {
          start_vertex = target.vertexes[i].clone();
        }
        target.vertexes[i].x = start_vertex.x + dx / this._view.scale;
        target.vertexes[i].y = start_vertex.y + dy / this._view.scale;
        target.vertexes = target.vertexes;
        // this.adjustValue(target);
      },

      /**
       * 在 gizmo 抬起鼠标时触发
       * @param event mousedown dom event
       */
      end: (updated, event) => {
      }
    };
  }

  onCreateRoot() {
    // 创建 svg 根节点的回调，可以在这里创建你的 svg 工具
    // this._root 可以获取到 Editor.Gizmo 创建的 svg 根节点

    // 实例：
    Editor.log('onCreateRoot')

    // 创建一个 svg 工具
    // group 函数文档 : http://documentup.com/wout/svg.js#groups
    this._tool = this._root.group();
    let target = this.target;
    const circles = [];
    // 接下来要定义绘画函数
    this._tool.plot = (points, position) => {
      // 移动到节点位置
      this._tool.move(position.x, position.y);
      // 清除原来的点
      circles.forEach(v => v.radius(0));
      // 画圆点
      points.map((v, i) => {
        // this._view.scale 编辑器缩放系数
        v = Editor.GizmosUtils.snapPixelWihVec2(v.mul(this._view.scale));
        let circle = circles[i];
        if (!circle) {
          circles[i] = circle = this._tool.circle()
            // 设置 fill 样式
            .fill({ color: 'rgba(0,128,255,0.8)' })
            // 设置点击区域，这里设置的是根据 fill 模式点击
            .style('pointer-events', 'fill')
            // 设置鼠标样式
            .style('cursor', 'move')
          // 注册点击事件
          this.registerMoveSvg(circle, i, { cursor: 'pointer' });
        }
        circle.center(v.x, -v.y).radius(10 * this._view.scale);
      })
    };
  }

  onUpdate() {
    // 更新 svg 工具

    // 获取 gizmo 依附的组件
    let target = this.target;

    // 获取 gizmo 依附的节点
    let node = this.node;

    // // 获取节点世界坐标
    let position = node.convertToWorldSpaceAR(cc.v2(0, 0));

    // 转换世界坐标到 svg view 上
    // svg view 的坐标体系和节点坐标体系不太一样，这里使用内置函数来转换坐标
    position = this.worldToPixel(position);

    // 对齐坐标，防止 svg 因为精度问题产生抖动
    position = Editor.GizmosUtils.snapPixelWihVec2(position);

    // 移动 svg 工具到坐标
    this._tool.plot(target.vertexes, position);
  }
}

module.exports = PointsPolygonGizmo;


// 欢迎关注公众号【白玉无冰】