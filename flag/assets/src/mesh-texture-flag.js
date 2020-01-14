// author: lamyoung.com

const gfx = cc.gfx;

cc.Class({
    extends: cc.Component,

    editor: CC_EDITOR && {
        executeInEditMode: true,
    },

    properties: {
        _offset: cc.v2(0, 0),
        /**
         * !#en Position offset
         * !#zh 位置偏移量
         * @property offset
         * @type {Vec2}
         */
        offset: {
            get: function () {
                return this._offset;
            },
            set: function (value) {
                this._offset = value;
                this._applyVertexes();
            },
            type: cc.Vec2
        },

        _spriteFrame: {
            default: null,
            type: cc.SpriteFrame
        },
        /**
         * !#en The sprite frame of the sprite.
         * !#zh 精灵的精灵帧
         * @property spriteFrame
         * @type {SpriteFrame}
         * @example
         * sprite.spriteFrame = newSpriteFrame;
         */
        spriteFrame: {
            get: function () {
                return this._spriteFrame;
            },
            set: function (value) {
                this._spriteFrame = value;
                this._applySpriteFrame();
            },
            type: cc.SpriteFrame,
        },

    },

    onLoad() {
        this._meshCache = {};
        this._vertexes = [];
        this._updateMesh();

        let renderer = this.node.getComponent(cc.MeshRenderer);
        if (!renderer) {
            renderer = this.node.addComponent(cc.MeshRenderer);
        }

        renderer.mesh = null;
        this.renderer = renderer;

        this._applySpriteFrame();
        this._applyVertexes();

        this.node.on('size-changed', () => {
            this._updateMesh();
            this._applyVertexes();
        }, this);
        this.node.on('anchor-changed', () => {
            this._updateMesh();
            this._applyVertexes();
        }, this);
    },

    _updateMesh() {
        this._vertexes = [];
        const _width = this.node.width;
        const _height = this.node.height;
        this._row = Math.ceil(_height / 10);
        this._col = Math.ceil(_width / 10);
        for (let _row = 0; _row < this._row + 1; _row++) {
            for (let _col = 0; _col < this._col + 1; _col++) {
                this._vertexes.push(cc.v2((_col - this._col * this.node.anchorX) * _width / this._col, (_row - this._row * this.node.anchorY) * _height / this._row));
            }
        };

        let mesh = this._meshCache[this._vertexes.length];
        if (!mesh) {
            mesh = new cc.Mesh();
            mesh.init(new gfx.VertexFormat([
                { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
                { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
            ]), this._vertexes.length, true);
            this._meshCache[this._vertexes.length] = mesh;
        }
        this.mesh = mesh;
        // cc.log('_updateMesh');
    },

    _applyVertexes() {
        // cc.log('_applyVertexes');

        // 设置坐标
        const mesh = this.mesh;
        mesh.setVertices(gfx.ATTR_POSITION, this._vertexes);
        // cc.log('_vertexes');
        // cc.log(this._vertexes);

        if (this.texture) {
            let uvs = [];
            // 计算uv
            for (const pt of this._vertexes) {
                const vx = (pt.x + this.texture.width * this.node.anchorX + this.offset.x) / this.texture.width;
                const vy = 1.0 - (pt.y + this.texture.height * this.node.anchorY + this.offset.y) / this.texture.height;
                uvs.push(cc.v2(vx, vy));
            }
            mesh.setVertices(gfx.ATTR_UV0, uvs);
            // cc.log('uvs');
            // cc.log(uvs);
        }

        if (this._vertexes.length >= 3) {
            // 计算顶点索引 
            let ids = [];
            let getIndexByRowCol = (_row, _col) => {
                return _row * (this._col + 1) + _col;
            }
            for (let _row = 0; _row < this._row; _row++) {
                for (let _col = 0; _col < this._col; _col++) {
                    ids.push(getIndexByRowCol(_row, _col), getIndexByRowCol(_row, _col + 1), getIndexByRowCol(_row + 1, _col));
                    ids.push(getIndexByRowCol(_row + 1, _col), getIndexByRowCol(_row + 1, _col + 1), getIndexByRowCol(_row, _col + 1));
                }
            };
            mesh.setIndices(ids);
            // cc.log('ids');
            // cc.log(ids);

            if (this.renderer.mesh != mesh) {
                // mesh 完成后再赋值给 MeshRenderer , 否则模拟器(mac)会跳出
                this.renderer.mesh = mesh;
            }
        } else {

        }
    },

    _applySpriteFrame() {
        // cc.log('_applySpriteFrame');
        if (this.spriteFrame) {
            const renderer = this.renderer;
            let material = renderer._materials[0];
            // Reset material
            let texture = this.spriteFrame.getTexture();
            material.define("USE_TEXTURE", true);
            material.setProperty('texture', texture);
            this.texture = texture;
        }
    },
});


// 欢迎关注公众号【白玉无冰】