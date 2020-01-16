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

        _row: 10,
        /**
         * !#zh 网格行数
         * @property cell_size
         * @type {Number}
         */
        row: {
            tooltip: '网格行数',
            get: function () {
                return this._row;
            },
            set: function (value) {
                value <= 0 ? value = 1 : '';
                if (this._row !== value) {
                    this._row = value;
                    this._updateMesh();
                    this._applyVertexes();
                }
            },
            min: 1,
            step: 1,
        },

        _col: 20,
        /**
         * !#zh 网格列数
         * @property cell_size
         * @type {Number}
         */
        col: {
            tooltip: '网格列数',
            get: function () {
                return this._col;
            },
            set: function (value) {
                value <= 0 ? value = 1 : '';
                if (this._col !== value) {
                    this._col = value;
                    this._updateMesh();
                    this._applyVertexes();
                }
            },
            min: 1,
            step: 1,
        },


        _speed: 10,
        /**
         * !#zh 速度
         * @property cell_size
         * @type {Number}
         */
        speed: {
            tooltip: '速度',
            get: function () {
                return this._speed;
            },
            set: function (value) {
                value <= 0 ? value = 0.1 : '';
                if (this._speed !== value) {
                    this._speed = value;
                    this._updateMaterial();
                }
            },
            min: 0.1,
            step: 0.1,
        },


        _amplitude: 5,
        /**
         * !#zh 幅度
         * @property cell_size
         * @type {Number}
         */
        amplitude: {
            tooltip: '幅度',
            get: function () {
                return this._amplitude;
            },
            set: function (value) {
                value <= 0 ? value = 0.1 : '';
                if (this._amplitude !== value) {
                    this._amplitude = value;
                    this._updateMaterial();
                }
            },
            min: 0.1,
            step: 1,
        },

        _wave: 5,
        /**
         * !#zh 波浪
         * @property cell_size
         * @type {Number}
         */
        wave: {
            tooltip: '波浪',
            get: function () {
                return this._wave;
            },
            set: function (value) {
                value <= 0 ? value = 0 : '';
                if (this._wave !== value) {
                    this._wave = value;
                    this._updateMaterial();
                }
            },
            min: 0,
            step: 1,
        },

    },

    onLoad() {
        this._meshCache = {};
        this._vertexes = [];

        // 添加 MeshRenderer
        let renderer = this.node.getComponent(cc.MeshRenderer);
        if (!renderer) {
            renderer = this.node.addComponent(cc.MeshRenderer);
        }
        renderer.mesh = null;
        this.renderer = renderer;

        // 加载对应材质
        cc.loader.loadRes('mat/sprite-flag', cc.Material, (err, mat) => {
            if (err) {
                cc.error(err.message || err);
                return;
            }
            let matt = new cc.Material();
            // 拷贝一份，避免共用材料
            matt.copy(mat);
            // cc.log(mat)
            // cc.log(matt)

            this.renderer.setMaterial(0, matt);
            this._updateMaterial();
        });


        this._updateMesh();
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

        // 确定顶点坐标
        this._vertexes = [];
        const _width = this.node.width;
        const _height = this.node.height;
        for (let _row = 0; _row < this._row + 1; _row++) {
            for (let _col = 0; _col < this._col + 1; _col++) {
                const x = (_col - this._col * this.node.anchorX) * _width / this._col;
                const y = (_row - this._row * this.node.anchorY) * _height / this._row;
                this._vertexes.push(cc.v2(x, y));
            }
        };

        // 绑定模型
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

        this._updateMaterial();
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
                const u = (pt.x + this.texture.width * this.node.anchorX + this.offset.x) / this.texture.width;
                const v = 1.0 - (pt.y + this.texture.height * this.node.anchorY + this.offset.y) / this.texture.height;
                uvs.push(cc.v2(u, v));
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
            let texture = this.spriteFrame.getTexture();
            this.texture = texture;
            this._updateMaterial();
        }
    },

    _updateMaterial() {
        // Reset material
        let material = this.renderer._materials[0];
        if (material) {
            if (this.texture) {
                // 设置 texture 
                material.define("USE_TEXTURE", true);
                material.setProperty('texture', this.texture);
            }

            // 设置着色器 uniform 参数
            material.setProperty('textureWidth', this.node.width);
            material.setProperty('speed', this.speed);
            material.setProperty('amplitude', this.amplitude);
            material.setProperty('wave', this.wave);
            if (this._vertexes.length > 0)
                material.setProperty('startPos', this._vertexes[0]);
        }
    },
});


// 欢迎关注公众号【白玉无冰】