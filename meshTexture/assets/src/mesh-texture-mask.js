// author: lamyoung.com

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
                this._updateMesh();
                if (this.temp_refresh || !CC_EDITOR) {
                    this._applyVertexes();
                }
            },
            type: [cc.Vec2]
        }
    },

    onLoad() {
        this._meshCache = {};

        this._updateMesh();

        let renderer = this.node.getComponent(cc.MeshRenderer);
        if (!renderer) {
            renderer = this.node.addComponent(cc.MeshRenderer);
        }

        renderer.mesh = null;
        this.renderer = renderer;
        let builtinMaterial = new cc.Material();
        builtinMaterial.copy(cc.Material.getBuiltinMaterial("unlit"));
        renderer.setMaterial(0, builtinMaterial);

        this._applySpriteFrame();
        this._applyVertexes();
    },

    _updateMesh() {
        let mesh = this._meshCache[this.vertexes.length];
        if (!mesh) {
            mesh = new cc.Mesh();
            mesh.init(new gfx.VertexFormat([
                { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
                { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
            ]), this.vertexes.length, true);
            this._meshCache[this.vertexes.length] = mesh;
        }
        this.mesh = mesh;
        // cc.log('_updateMesh');
    },

    _applyVertexes() {
        // cc.log('_applyVertexes');

        // 设置坐标
        const mesh = this.mesh;
        mesh.setVertices(gfx.ATTR_POSITION, this.vertexes);

        if (this.texture) {
            let uvs = [];
            // 计算uv
            for (const pt of this.vertexes) {
                const vx = (pt.x + this.texture.width / 2 + this.offset.x) / this.texture.width;
                const vy = 1.0 - (pt.y + this.texture.height / 2 + this.offset.y) / this.texture.height;
                uvs.push(cc.v2(vx, vy));
            }
            mesh.setVertices(gfx.ATTR_UV0, uvs);
        }

        if (this.vertexes.length >= 3) {
            // 计算顶点索引 
            let ids = [];
            const vertexes = [].concat(this.vertexes);

            // 多边形切割，未实现相交的复杂多边形，确保顶点按顺序且围成的线不相交
            let index = 0, rootIndex = -1;
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
                        // 切耳朵，是凸点，且没有其他点在三角形内
                        ids = ids.concat([this.vertexes.indexOf(p1), this.vertexes.indexOf(p2), this.vertexes.indexOf(p3)]);
                        vertexes.splice(vertexes.indexOf(p2), 1);
                        rootIndex = index;
                    } else {
                        index = (index + 1) % vertexes.length;
                        if (index === rootIndex) {
                            cc.log('循环一圈未发现');
                            break;
                        }
                    }
                } else {
                    index = (index + 1) % vertexes.length;
                    if (index === rootIndex) {
                        cc.log('循环一圈未发现');
                        break;
                    }
                }
            }
            ids = ids.concat(vertexes.map(v => { return this.vertexes.indexOf(v) }));
            mesh.setIndices(ids);

            if (this.renderer.mesh != mesh) {
                // mesh 完成后再赋值给 MeshRenderer , 否则模拟器(mac)会跳出
                this.renderer.mesh = mesh;
            }
        } else {

        }
    },

    // 判断一个点是否在三角形内
    _testInTriangle(point, triA, triB, triC) {
        let AB = triB.sub(triA), AC = triC.sub(triA), BC = triC.sub(triB), AD = point.sub(triA), BD = point.sub(triB);
        return (AB.cross(AC) >= 0 ^ AB.cross(AD) < 0)  // D,C 在AB同同方向
            && (AB.cross(AC) >= 0 ^ AC.cross(AD) >= 0) // D,B 在AC同同方向
            && (BC.cross(AB) > 0 ^ BC.cross(BD) >= 0); // D,A 在BC同同方向
    },

    _applySpriteFrame() {
        // cc.log('_applySpriteFrame');
        if (this.spriteFrame) {
            const renderer = this.renderer;
            let material = renderer._materials[0];
            // Reset material
            let texture = this.spriteFrame.getTexture();
            material.define("USE_DIFFUSE_TEXTURE", true);
            material.setProperty('diffuseTexture', texture);
            this.texture = texture;
        }
    },
});


// 欢迎关注公众号【白玉无冰】