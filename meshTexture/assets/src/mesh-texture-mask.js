// author : lamyoung.com


const gfx = cc.gfx;

cc.Class({
    extends: cc.Component,

    editor: CC_EDITOR && {
        executeInEditMode: true,
    },

    properties: {

        _temp_refresh: false,
        temp_refresh: {
            displayName: '编辑器自动刷新效果',
            type: cc.Boolean,
            get: function () {
                return this._temp_refresh;
            },
            set: function (v) {
                this._temp_refresh = v;
                this._applyVertexes();
            }
        },

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
                if (this.temp_refresh || !CC_EDITOR)
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


        _vertexes: {
            default: [],
            type: [cc.Vec2]
        },
        /**
         * !#en Polygon points
         * !#zh 多边形顶点数组
         * @property points
         * @type {Vec2[]}
         */
        vertexes: {
            tooltip: '多边形顶点数组(至少三个)',
            get: function () {
                return this._vertexes;
            },
            set: function (value) {
                this._vertexes = value;
                if (this.temp_refresh || !CC_EDITOR)
                    this._applyVertexes();
            },
            type: [cc.Vec2]
        }

    },

    onLoad() {
        const vfmt = new gfx.VertexFormat([
            { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
            { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
        ]);

        const mesh = new cc.Mesh();
        mesh.init(vfmt, 9, true);
        this.mesh = mesh;

        let renderer = this.node.getComponent(cc.MeshRenderer);
        if (!renderer) {
            renderer = this.node.addComponent(cc.MeshRenderer);
        }
        // console.log(renderer)
        renderer.mesh = null;
        this.renderer = renderer;

        this._applySpriteFrame();
        this._applyVertexes();
    },

    _applyVertexes() {
        // cc.log('_applyVertexes');
        const mesh = this.mesh;

        mesh.setVertices(gfx.ATTR_POSITION, this.vertexes);

        let uvs = [];
        if (this.texture) {
            for (const pt of this.vertexes) {
                const vx = (pt.x + this.texture.width / 2 + this.offset.x) / this.texture.width;
                const vy = 1.0 - (pt.y + this.texture.height / 2 + this.offset.y) / this.texture.height;
                uvs.push(cc.v2(vx, vy));
            }
            mesh.setVertices(gfx.ATTR_UV0, uvs);
        }

        if (this.vertexes.length >= 3) {
            let ids = [];
            const vertexes = [].concat(this.vertexes);

            let index = 0;
            while (vertexes.length > 3) {
                const p1 = vertexes[index];
                const p2 = vertexes[(index + 1) % vertexes.length];
                const p3 = vertexes[(index + 2) % vertexes.length];

                const v1 = p2.sub(p1);
                const v2 = p3.sub(p2);
                if (v1.cross(v2) >= 0) {
                    // 是凸点
                    let isIn = false;
                    for (const p_t of vertexes) {
                        if (p_t !== p1 && p_t !== p2 && p_t !== p3 && this._testInTriangle(p_t, p1, p2, p3)) {
                            // 其他点在三角形内
                            isIn = true;
                            break;
                        }
                    }
                    if (!isIn) {
                        // 切耳朵
                        ids = ids.concat([this.vertexes.indexOf(p1), this.vertexes.indexOf(p2), this.vertexes.indexOf(p3)]);
                        vertexes.splice(vertexes.indexOf(p2), 1);
                    } else {
                        index = (index + 1) % vertexes.length;
                    }
                } else {
                    index = (index + 1) % vertexes.length;
                }
            }
            // cc.log(vertexes);
            ids = ids.concat(vertexes.map(v => { return this.vertexes.indexOf(v) }));
            // cc.log('ids');
            // cc.log(ids);
            mesh.setIndices(ids);
            if (!this.renderer.mesh) {
                this.renderer.mesh = mesh;
            }
        } else {

        }

    },

    // 判断一个点是否在三角形内
    _testInTriangle(point, triA, triB, triC) {
        let AB = triB.sub(triA), AC = triC.sub(triA), BC = triC.sub(triB), AD = point.sub(triA);
        return (AB.cross(AC) >= 0 ^ AB.cross(AD) < 0) &&
            (AB.cross(AC) >= 0 ^ AC.cross(AD) >= 0) &&
            (BC.cross(AB) > 0 ^ BC.cross(point.sub(triB)) >= 0);
    },

    _applySpriteFrame() {
        // cc.log('_applySpriteFrame');
        if (this.spriteFrame) {
            const renderer = this.renderer;
            let material = renderer._materials[0];
            // Reset material
            let texture = this.spriteFrame.getTexture();
            material.setProperty('diffuseTexture', texture);
            this.texture = texture;
        }
    },
});


// 欢迎关注公众号【白玉无冰】