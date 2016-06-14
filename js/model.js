
// 任务走动时跟随控制摄像头
var CameraFollow = function(a) {
    function b(b, c) {
        var d = b.property;
        if (d.startsWith("position") || d.startsWith("rotation")) {
            var e = c.p(),
            f = a.getDistance(),
            g = c.worldPosition(new mono.Vec3( - 2, 1, 0), f);
            a.lookAt(e),
            a.setPosition(g)
        }
    }
    this.setHost = function(c) {
        a._hostNode && a._hostNode.removePropertyChangeListener(b),
        a._hostNode = c,
        c.addPropertyChangeListener(function(a) {
            b(a, c)
        })
    }
},

//档案馆模型对象
demo = {
    LAZY_MIN: 1e3,
    LAZY_MAX: 6e3,
    CLEAR_COLOR: "#39609B",
    RES_PATH: "res",
    lastElement: null,
    timer: null,
    //取资源
    getRes: function(a) {
        return demo.RES_PATH + "/" + a
    },

    getEnvMap: function() {
        if (!demo.defaultEnvmap) {
            demo.defaultEnvmap = [];
            for (var a = demo.getRes("room.jpg"), b = 0; 6 > b; b++) demo.defaultEnvmap.push(a)
        }
        return demo.defaultEnvmap
    },
    _creators: {},
    _filters: {},
    _shadowPainters: {},
    registerCreator: function(a, b) {
        this._creators[a] = b
    },
    getCreator: function(a) {
        return this._creators[a]
    },
    registerFilter: function(a, b) {
        this._filters[a] = b
    },
    getFilter: function(a) {
        return this._filters[a]
    },
    registerShadowPainter: function(a, b) {
        this._shadowPainters[a] = b
    },
    getShadowPainter: function(a) {
        return this._shadowPainters[a]
    },
    initOverview: function(a) {
        new mono.Overview3D(a)
    },
    init: function(a) {
        var b = window.network = new mono.Network3D;
        demo.typeFinder = new mono.QuickFinder(b.getDataBox(), "type", "client"),
        demo.labelFinder = new mono.QuickFinder(b.getDataBox(), "label", "client");
        var c = new mono.PerspectiveCamera(15, 1.5, 30, 3e4);
        b.setCamera(c);
        var d = new mono.DefaultInteraction(b);
        d.yLowerLimitAngle = Math.PI / 180 * 2,
        d.yUpLimitAngle = Math.PI / 2,
        d.maxDistance = 2e4,
        d.minDistance = 50,
        d.zoomSpeed = 3,
        d.panSpeed = .2;
        var e = new mono.EditInteraction(b);
        e.setShowHelpers(!0),
        e.setScaleable(!1),
        e.setRotateable(!1),
        e.setTranslateable(!0),
        b.setInteractions([d, new mono.SelectionInteraction(b), e]),
        b.isSelectable = function(a) {
            return b.moveView && "rack" === a.getClient("type")
        },
        b.editableFunction = function(a) {
            return b.moveView && "rack" === a.getClient("type")
        },
        document.getElementById(a).appendChild(b.getRootView());
        var f = new Tooltip(["BusinessId"], ["000000"]);
        document.body.appendChild(f.getView());
        var g = !1,
        h = [{
            label: "场景复位",
            icon: "reset.png",
            clickFunction: function() {
                demo.resetView(b)
            }
        },
        {
            label: "走线管理",
            icon: "connection.png",
            clickFunction: function() {
                var a = b.connectionView;
                demo.resetView(b),
                a || demo.toggleConnectionView(b)
            }
        },
        {
            label: "人工路径",
            icon: "person.png",
            clickFunction: function() {
                demo.togglePersonVisible(g, b),
                g = !g
            }
        },
        {
            label: "调试信息",
            icon: "fps.png",
            clickFunction: function() {
                demo.toggleFpsView(b)
            }
        },
        {
            label: "拖拽机柜",
            icon: "edit.png",
            clickFunction: function() {
                var a = b.moveView;
                demo.resetView(b),
                a || demo.toggleMoveView(b)
            }
        },
        {
            label: "温度图",
            icon: "temperature.png",
            clickFunction: function() {
                var a = b.temperatureView;
                demo.resetView(b),
                a || demo.toggleTemperatureView(b)
            }
        },
        {
            label: "可用空间",
            icon: "space.png",
            clickFunction: function() {
                var a = b.spaceView;
                demo.resetView(b),
                a || demo.toggleSpaceView(b)
            }
        },
        {
            label: "机柜利用率",
            icon: "usage.png",
            clickFunction: function() {
                var a = b.usageView;
                demo.resetView(b),
                a || demo.toggleUsageView(b)
            }
        },
        {
            label: "空调风向",
            icon: "air.png",
            clickFunction: function() {
                var a = b.airView;
                demo.resetView(b),
                a || demo.toggleAirView(b)
            }
        },
        {
            label: "烟雾监控",
            icon: "smoke.png",
            clickFunction: function() {
                var a = b.smokeView;
                demo.resetView(b),
                a || demo.toggleSmokeView(b)
            }
        },
        {
            label: "漏水监测",
            icon: "water.png",
            clickFunction: function() {
                var a = b.waterView;
                demo.resetView(b),
                a || demo.toggleWaterView(b)
            }
        },
        {
            label: "防盗监测",
            icon: "security.png",
            clickFunction: function() {
                var a = b.laserView;
                demo.resetView(b),
                a || demo.toggleLaserView(b)
            }
        },
        {
            label: "供电电缆",
            icon: "power.png",
            clickFunction: function() {
                var a = b.powerView;
                demo.resetView(b),
                a || demo.togglePowerView(b)
            }
        },
        {
            label: "告警巡航",
            icon: "alarm.png",
            clickFunction: function() {
                b.inspecting || (demo.resetView(b), demo.resetRackPosition(b), b.inspecting = !0, demo.inspection(b))
            }
        }];
        demo.setupToolbar(h),
        this.setupControlBar(b),
        mono.Utils.autoAdjustNetworkBounds(b, document.documentElement, "clientWidth", "clientHeight"),
        b.getRootView().addEventListener("dblclick",
        function(a) {
            demo.handleDoubleClick(a, b)
        }),
        b.getRootView().addEventListener("mousemove",
        function(a) {
            demo.handleMouseMove(a, b, f)
        }),
        demo.setupLights(b.getDataBox()),
        b.getDataBox().getAlarmBox().addDataBoxChangeListener(function(a) {
            var c = a.data;
            if ("add" === a.kind) {
                var d = b.getDataBox().getDataById(c.getElementId());
                d.setStyle("m.alarmColor", null)
            }
        }),
        b.getDataBox().addDataPropertyChangeListener(function(a) {
            var c = a.source,
            d = a.property,
            e = a.oldValue,
            f = a.newValue;
            "position" == d && b.moveView && e.y != f.y && c.setPositionY(e.y)
        }),
        b.addInteractionListener(function(a) {
            "liveMoveEnd" == a.kind && demo.dirtyShadowMap(b)
        });
        var i = (new Date).getTime();
        demo.loadData(b);
        var j = (new Date).getTime();
        console.log("time:  " + (j - i)),
        demo.startSmokeAnimation(b),
        demo.startFpsAnimation(b),
        demo.resetCamera(b),
        this.initOverview(b)
    },

    //重置摄像头
    resetCamera: function(a) {
        a.getCamera().setPosition(2e3, 1200, 3e3),
        a.getCamera().lookAt(new mono.Vec3(0, 0, 0))
    },
    //阴影
    dirtyShadowMap: function(a) {
        var b = a.getDataBox().shadowHost,
        c = demo.typeFinder.findFirst("floorCombo");
        demo.updateShadowMap(c, b, b.getId(), a.getDataBox())
    },
    //隐藏显示模型
    togglePersonVisible: function(a, b) {
        var c = b.getCamera(),
        d = b.getDataBox();
        a ? this.removeObj(d) : this.loadObj(c, d)
    },
    //移除巡查人员和路线
    removeObj: function(a) {
        var b = demo.typeFinder.find("person").get(0);
        b.animate.stop(),
        a.removeByDescendant(b);
        var c = demo.typeFinder.find("trail").get(0);
        a.removeByDescendant(c)
    },
    //打开柜门
    _playRackDoorAnimate: function(a) {
        var b = demo.labelFinder.findFirst(a),
        c = b.getChildren().get(0);
        c.getClient("animation") && demo.playAnimation(c, c.getClient("animation"))
    },
    //加载巡查人员模型
    loadObj: function(a, b) {
        var c = demo.getRes("worker.obj"),
        d = demo.getRes("worker.mtl"),
        e = new mono.OBJMTLLoader;
        e.load(c, d, {
            worker: demo.getRes("worker.png")
        },
        function(c) {
            c.setScale(3, 3, 3),
            c.setClient("type", "person"),
            b.addByDescendant(c);
            var d = function(a) {
                a && a.getChildren() && a.getChildren().forEach(function(a) {
                    a.setStyle("m.normalType", mono.NormalTypeSmooth),
                    d(a)
                })
            };
            d(c);
            var e = -650,
            f = 600,
            g = 0;
            c.setPosition(e, 0, f),
            c.setRotationY(g);
            var h = [[ - 350, 600], [ - 350, 400], [450, 400], [450, 100], [ - 200, 100], [ - 200, -100], [ - 370, -100], [ - 370, -150]],
            i = new CameraFollow(a);
            i.setHost(c);
            var j = demo.typeFinder.findFirst("left-door"),
            k = demo.typeFinder.findFirst("right-door");
            demo.playAnimation(j, j.getClient("animation")),
            demo.playAnimation(k, k.getClient("animation"),
            function() {
                c.animate = demo.createPathAnimates(a, c, h, !1, null,
                function() {
                    demo._playRackDoorAnimate("1")
                }),
                c.animate.play()
            });
            var l = new mono.Path;
            l.moveTo(c.getPositionX(), c.getPositionZ());
            for (var m = 0; m < h.length; m++) l.lineTo(h[m][0], h[m][1]);
            l = mono.PathNode.prototype.adjustPath(l, 5);
            var n = new mono.PathCube(l, 3, 1);
            n.s({
                "m.type": "phong",
                "m.specularStrength": 30,
                "m.color": "#298A08",
                "m.ambient": "#298A08",
                "m.texture.image": demo.getRes("flow.jpg"),
                "m.texture.repeat": new mono.Vec2(150, 1)
            }),
            n.setRotationX(Math.PI),
            n.setPositionY(5),
            n.setClient("type", "trail"),
            b.add(n)
        })
    },
    //绘制巡查路线
    createPathAnimates: function(a, b, c, d, e, f) {
        var g = [];
        if (c && c.length > 0) {
            for (var h = b.getPositionX(), i = b.getPositionZ(), j = b.getRotationY(), k = function(a, b, c, d) {
                if (c != d && NaN != c) {
                    c - d > Math.PI && (c -= 2 * Math.PI),
                    c - d < -Math.PI && (c += 2 * Math.PI);
                    var e = new twaver.Animate({
                        from: d,
                        to: c,
                        type: "number",
                        dur: 300 * Math.abs(c - d),
                        easing: "easeNone",
                        onPlay: function() {
                            b.animate = this
                        },
                        onUpdate: function(a) {
                            b.setRotationY(a)
                        }
                    });
                    return e.toAngle = c,
                    e
                }
            },
            l = 0; l < c.length; l++) {
                var m = c[l],
                n = m[0],
                o = m[1],
                p = Math.atan2( - (o - i), n - h),
                q = k(a, b, p, j);
                q && (g.push(q), j = q.toAngle);
                var r = new twaver.Animate({
                    from: {
                        x: h,
                        y: i
                    },
                    to: {
                        x: n,
                        y: o
                    },
                    type: "point",
                    dur: 5 * Math.sqrt((n - h) * (n - h) + (o - i) * (o - i)),
                    easing: "easeNone",
                    onPlay: function() {
                        b.animate = this
                    },
                    onUpdate: function(a) {
                        b.setPositionX(a.x),
                        b.setPositionZ(a.y)
                    }
                });
                g.push(r),
                h = n,
                i = o
            }
            if (void 0 != e && j != e) {
                var q = k(a, b, e, j);
                q && g.push(q)
            }
        }
        g[g.length - 1].onDone = f;
        for (var s, l = 0; l < g.length; l++) l > 0 ? (g[l - 1].chain(g[l]), d && l == g.length - 1 && g[l].chain(s)) : s = g[l];
        return s
    },

    // toggleConnectionView: function(a) {
    //     a.connectionView = !a.connectionView;
    //     var b = a.connectionView,
    //     c = a.getDataBox(),
    //     d = demo.typeFinder.find("connection"),
    //     e = demo.typeFinder.find("rail");
    //     d.forEach(function(a) {
    //         if (a.setVisible(b), a.billboard || (a.billboard = new mono.Billboard, a.billboard.s({
    //             "m.texture.image": demo.createConnectionBillboardImage("0"),
    //             "m.vertical": !0
    //         }), a.billboard.setScale(60, 30, 1), a.billboard.setPosition(400, 230, 330), c.add(a.billboard)), a.billboard.setVisible(b), a.isVisible()) {
    //             var d = new twaver.Animate({
    //                 from: 0,
    //                 to: 1,
    //                 type: "number",
    //                 dur: 1e3,
    //                 repeat: Number.POSITIVE_INFINITY,
    //                 reverse: !1,
    //                 onUpdate: function(b) {
    //                     if (a.s({
    //                         "m.texture.offset": new mono.Vec2(b, 0)
    //                     }), 1 === b) {
    //                         var c = "54" + parseInt(10 * Math.random()) + "." + parseInt(100 * Math.random());
    //                         a.billboard.s({
    //                             "m.texture.image": demo.createConnectionBillboardImage(c)
    //                         })
    //                     }
    //                 }
    //             });
    //             d.play(),
    //             a.offsetAnimate = d
    //         } else a.offsetAnimate && a.offsetAnimate.stop()
    //     }),
    //     e.forEach(function(a) {
    //         a.setVisible(b)
    //     })
    // },
    setupLights: function(a) {
        var b = new mono.PointLight(16777215, .3);
        b.setPosition(0, 1e3, -1e3),
        a.add(b);
        var b = new mono.PointLight(16777215, .3);
        b.setPosition(0, 1e3, 1e3),
        a.add(b);
        var b = new mono.PointLight(16777215, .3);
        b.setPosition(1e3, -1e3, 1e3),
        a.add(b),
        a.add(new mono.AmbientLight("white"))
    },

    //双击事件
    handleDoubleClick: function(a, b) {
        var c = b.getCamera(),
        d = b.getDefaultInteraction(),
        e = demo.findFirstObjectByMouse(b, a);
        if (e) {
            var f = e.element,
            g = e.point,
            h = c.getTarget();

            if (f.getClient("animation")) demo.playAnimation(f, f.getClient("animation"));
            else if (f.getClient("dbl.func")) {
                var i = f.getClient("dbl.func");
                i()
            } else demo.animateCamera(c, d, h, g)
        } else {
            var h = c.getTarget(),
            g = new mono.Vec3(0, 0, 0);
            demo.animateCamera(c, d, h, g)
        }
        demo._handleDoubleClick(f, b)
    },
     //双击统计图
    _handleDoubleClick: function(a, b) {
        if ("tv" === a.getClient("type")) {
            var c = document.createElement("iframe");
            c.setAttribute("width", "100%"),
            c.setAttribute("height", "100%"),
            c.setAttribute("frameBorder", 0),
            c.setAttribute("src", "chart.html"),
            demo.showDialog(c, "档案馆统计", 850, 600)
        }else if("rack"=== a.getClient("type")){
            a.setClient("animation", "pullOut.x")
            //此处实现档案柜挪动效果
            //console.log("rack");
        }
    },
    //鼠标移动事件
    handleMouseMove: function(a, b, c) {
        var d = b.getElementsByMouseEvent(a),
        e = null,
        f = c.getView();
        if (d.length) {
            var g = d[0],
            h = g.element;
            "card" === h.getClient("type") && h.getClient("isAlarm") && (e = h, c.setValues([h.getClient("BID")]))
        }
        demo.lastElement != e && (clearTimeout(demo.timer), e && (demo.timer = setTimeout(function() {
            f.style.display = "block",
            f.style.position = "absolute",
            f.style.left = window.lastEvent.pageX - f.clientWidth / 2 + "px",
            f.style.top = window.lastEvent.pageY - f.clientHeight - 15 + "px"
        },
        1e3))),
        demo.lastElement = e,
        null == e && (f.style.display = "none"),
        window.lastEvent = a
    },

    copyProperties: function(a, b, c) {
        if (a && b) for (var d in a) c && c.indexOf(d) >= 0 || (b[d] = a[d])
    },
    createCubeObject: function(a) {
        var b = a.translate || [0, 0, 0],
        c = a.width,
        d = a.height,
        e = a.depth,
        f = a.sideColor,
        g = a.topColor,
        h = new mono.Cube(c, d, e);
        return h.setPosition(b[0], b[1] + d / 2, b[2]),
        h.s({
            "m.color": f,
            "m.ambient": f,
            "left.gm.lightmap.imae": demo.getRes("inside_lightmap.jpg"),
            "right.m.lightmap.image": demo.getRes("outside_lightmap.jpg"),
            "front.m.lightmap.image": demo.getRes("outside_lightmap.jpg"),
            "back.m.lightmap.image": demo.getRes("inside_lightmap.jpg"),
            "top.m.color": g,
            "top.m.ambient": g,
            "bottom.m.color": g,
            "bottom.m.ambient": g
        }),
        h.setClient("type", "rack"),
        h
    },
    create2DPath: function(a) {
        for (var b, c = 0; c < a.length; c++) {
            var d = a[c];
            b ? b.lineTo(d[0], d[1], 0) : (b = new mono.Path, b.moveTo(d[0], d[1], 0))
        }
        return b
    },
    create3DPath: function(a) {
        for (var b, c = 0; c < a.length; c++) {
            var d = a[c];
            b ? b.lineTo(d[0], d[1], d[2]) : (b = new mono.Path, b.moveTo(d[0], d[1], d[2]))
        }
        return b
    },
    createPathObject: function(a) {
        var b = a.translate || [0, 0, 0],
        c = a.width,
        d = a.height,
        e = a.data,
        f = this.create2DPath(e),
        g = a.insideColor,
        h = a.outsideColor,
        i = a.topColor,
        j = this.createWall(f, c, d, g, h, i);
        return j.setPosition(b[0], b[1], -b[2]),
        j.shadow = a.shadow,
        j
    },
    filterJson: function(a, b) {
        for (var c = [], d = 0; d < b.length; d++) {
            var e = b[d],
            f = e.type,
            g = this.getFilter(f);
            if (g) {
                var h = g(a, e);
                h && (h instanceof Array ? c = c.concat(h) : (this.copyProperties(e, h, ["type"]), c.push(h)))
            } else c.push(e)
        }
        return c
    },
    createCombo: function(a) {
        for (var b = [], c = [], d = [], e = 0; e < a.length; e++) {
            var f = a[e],
            g = f.op || "+",
            h = f.style,
            i = (f.translate || [0, 0, 0], f.rotate || [0, 0, 0]),
            j = null;
            "path" === f.type && (j = this.createPathObject(f)),
            "cube" === f.type && (j = this.createCubeObject(f)),
            j && (j.setRotation(i[0], i[1], i[2]), h && j.s(h), b.push(j), b.length > 1 && c.push(g), d.push(j.getId()))
        }
        if (b.length > 0) {
            var k = new mono.ComboNode(b, c);
            return k.setNames(d),
            k
        }
        return null
    },
    loadData: function(a) {
        var b = demo.filterJson(a.getDataBox(), dataJson.objects),
        c = a.getDataBox();
        a.setClearColor(demo.CLEAR_COLOR);
        for (var d, e, f = [], g = [], h = [], i = 0; i < b.length; i++) {
            var j = b[i],
            k = j.op,
            l = j.style,
            m = j.client,
            n = (j.translate || [0, 0, 0], j.rotate || [0, 0, 0]),
            o = null;
            "path" === j.type && (o = this.createPathObject(j)),
            "cube" === j.type && (o = this.createCubeObject(j)),
            j.shadowHost && (d = o, e = o.getId(), c.shadowHost = d);
            var p = demo.getCreator(j.type);
            if (p) p(c, j);
            else if (o) {
                if (o.shadow = j.shadow, o.setRotation(n[0], n[1], n[2]), l && o.s(l), m) for (var q in m) o.setClient(q, m[q]);
                k ? (f.push(o), f.length > 1 && g.push(k), h.push(o.getId())) : c.add(o)
            }
        }
        if (f.length > 0) {
            var r = new mono.ComboNode(f, g);
            r.setNames(h),
            r.setClient("type", "floorCombo"),
            c.add(r),
            d && e && setTimeout(function() {
                demo.updateShadowMap(r, d, e, c)
            },
            demo.LAZY_MAX)
        }
    },
    updateShadowMap: function(a, b, c, d) {
        var e = demo.createShadowImage(d, b.getWidth(), b.getDepth()),
        f = c + "-top.m.lightmap.image";
        a.setStyle(f, e)
    },
    //形成柜子里的文档
    loadRackContent: function(a, b, c, d, e, f, g, h, i, j, k, l, m) {
        for (var n = 10,
        o = 2,
        p = !1; f - 28 > n;) {
            //var q = parseInt(3 * Math.random()) + 1,
            //r = "server" + q + ".jpg";
            var r="server3.png";
            //3 === q && (r = "server3.png");
            var s = (n > 100) && !p && h ? h.color: null,
            t = this.createServer(a, i, j, r, s, m),
            u = t.getBoundingBox().size();
            if (s && (p = !0), t.setPositionY(n + u.y / 2 - f / 2), t.setPositionZ(t.getPositionZ() + 5), t.setParent(l), n = n + u.y + o, n > 180) {
                a.removeByDescendant(t, !0);
                break
            }
        }
    },

    createServer: function(a, b, c, d, e, f) {
        var g = {
            // "server1.jpg": 25,
            // "server2.jpg": 25,
            "server3.png": 25
        },
        h = (b.getPositionX(), b.getPositionZ(), c.getWidth()),
        i = g[d],
        j = c.getDepth(),
        k = new mono.Cube(h - 2, i - 2, j - 4),
        l = e ? e: "#5B6976";
        k.s({
            "m.color": l,
            "m.ambient": l,
            "m.type": "phong",
            "m.texture.image": demo.getRes("rack_inside.jpg")
        }),
        k.setPosition(0, .5, (b.getDepth() - k.getDepth()) / 2);
        var m = new mono.Cube(h + 2, i + 1, .5);
        if (e = e ? e: "#FFFFFF", m.s({
            "m.texture.image": demo.getRes("rack_inside.jpg"),
            "front.m.texture.image": demo.RES_PATH + "/" + d,
            "front.m.texture.repeat": new mono.Vec2(1, 1),
            "m.specularStrength": 100,
            "m.transparent": !0,
            "m.color": e,
            "m.ambient": e
        }), m.setPosition(0, 0, k.getDepth() / 2 + (b.getDepth() - k.getDepth()) / 2), "server3.png" == d) {
            var n = "#FFFFFF";
            m.s({
                "m.color": n,
                "m.ambient": n
            })
        }
        var o = new mono.ComboNode([k, m], ["+"]);
        if (o.setClient("animation", "pullOut.z"), o.setPosition(.5, 0, -5), a.add(o), "server3.png" == d) for (var p = !1,
        q = 2.1008,
        r = .9897,
        h = h + 2,
        i = i + 1,
        s = (h - 2 * q) / 14, t = 14, u = 0; t > u; u++) {
            var v = "#FFFFFF";
            u > 5 && !p && (v = e, p = !0);
            var w = {
                height: i - 2 * r,
                width: s,
                depth: .4 * j,
                pic: demo.RES_PATH + "/card" + (u % 4 + 1) + ".png",
                color: v
            },
            x = demo.createCard(w);
            a.add(x),
            x.setParent(o),
            x.setClient("type", "card"),
            x.setClient("BID", "card-" + u),
            x.setClient("isAlarm", "#FFFFFF" != v),
            x.p( - h / 2 + q + (u + .5) * s, -i / 2 + r, m.getPositionZ() - 1),
            x.setClient("animation", "pullOut.z"),
            x.getClient("isAlarm") && (f.alarmCard = x)
        }
        return o
    },
    createCard: function(a) {
        var b = a.translate || [0, 0, 0],
        c = b[0],
        d = b[1],
        e = b[2],
        f = a.width || 10,
        g = a.height || 50,
        h = a.depth || 50,
        i = a.rotate || [0, 0, 0],
        j = a.color || "white",
        k = a.pic || demo.getRes("card1.png"),
        l = [{
            type: "cube",
            width: f,
            height: g,
            depth: 1,
            translate: [c, d, e + 1],
            rotate: i,
            op: "+",
            style: {
                "m.color": j,
                "m.ambient": j,
                "m.texture.image": demo.getRes("gray.png"),
                "front.m.texture.image": k,
                "back.m.texture.image": k
            }
        },
        {
            type: "cube",
            width: 1,
            height: .95 * g,
            depth: h,
            translate: [c, d, e - h / 2 + 1],
            rotate: i,
            op: "+",
            style: {
                "m.color": j,
                "m.ambient": j,
                "m.texture.image": demo.getRes("gray.png"),
                "left.m.texture.image": demo.getRes("card_body.png"),
                "right.m.texture.image": demo.getRes("card_body.png"),
                "left.m.texture.flipX": !0,
                "m.transparent": !0,
                "m.lightmap.image": demo.getRes("outside_lightmap.jpg")
            }
        }];
        return demo.createCombo(l)
    },
    //canvas写字
    createShadowImage: function(a, b, c) {
        var d = document.createElement("canvas");
        d.width = b,
        d.height = c;
        var e = d.getContext("2d");
        e.beginPath(),
        e.rect(0, 0, b, c),
        e.fillStyle = "white",
        e.fill();
        var f = function(a, b, c, d, e) {
            var f = "#0B2F3A";
            a.font = '30px "Microsoft Yahei" ',
            a.fillStyle = f,
            a.textAlign = "center",
            a.textBaseline = "middle",
            a.fillText(b, d, e),
            a.strokeStyle = f,
            a.lineWidth = 3,
            a.strokeText(b, d, e),
            c && (e += 52, f = "#FE642E", a.font = '20px "Microsoft Yahei" ', a.fillStyle = f, a.textAlign = "center", a.textBaseline = "middle", a.fillText(c, d, e))
        };
        return f(e, "XX市国土资源局", "档案管", 220, 1120),

               // f(e, "档案柜2", "计划财务类", 590, 1e3),
               // f(e, "档案柜3", "其他类", 1020, 1e3),
        a.forEach(function(a) {
            if (a instanceof mono.Entity && a.shadow) {
                var d = a.getPosition() || {
                    x: 0,
                    y: 0,
                    z: 0
                },
                f = a.getRotation() || {
                    x: 0,
                    y: 0,
                    z: 0
                },
                f = -f[1];
                demo.paintShadow(a, e, b, c, d, f)
            }
        }),
        d
    },
    paintShadow: function(a, b, c, d, e, f) {
        var g = a.getClient("type"),
        h = demo.getShadowPainter(g);
        h && h(a, b, c, d, e, f)
    },
    findFirstObjectByMouse: function(a, b) {
        var c = a.getElementsByMouseEvent(b);
        if (c.length) for (var d = 0; d < c.length; d++) {
            var e = c[d],
            f = e.element;
            if (! (f instanceof mono.Billboard)) return e
        }
        return null
    },
    //控制摄像头
    animateCamera: function(a, b, c, d, e) {
        var f = a.getPosition().sub(a.getTarget()),
        g = new twaver.Animate({
            from: 0,
            to: 1,
            dur: 500,
            easing: "easeBoth",
            onUpdate: function(e) {
                var g = c.x + (d.x - c.x) * e,
                h = c.y + (d.y - c.y) * e,
                i = c.z + (d.z - c.z) * e,
                j = new mono.Vec3(g, h, i);
                a.lookAt(j),
                b.target = j;
                var k = (new mono.Vec3).addVectors(f, j);
                a.setPosition(k)
            }
        });
        g.onDone = e,
        g.play()
    },
    //播放动画
    playAnimation: function(a, b, c) {
        var d = b.split(".");
        if ("pullOut" === d[0]) {
            var e = d[1];
            demo.animatePullOut(a, e, c)
        }
        if ("rotate" === d[0]) {
            var f = d[1],
            g = d[2],
            h = d[3];
            demo.animateRotate(a, f, g, h, c)
        }
    },
    //移动动画效果
    animatePullOut: function(a, b, c) {
        var d = a.getBoundingBox().size().multiply(a.getScale()),
        e = 1,
        f = new mono.Vec3(0, 0, 1),
        g = 0;
        "x" === b && (f = new mono.Vec3(1, 0, 0), g = d.x),
        "-x" === b && (f = new mono.Vec3( - 1, 0, 0), g = d.x),
        "y" === b && (f = new mono.Vec3(0, 1, 0), g = d.y),
        "-y" === b && (f = new mono.Vec3(0, -1, 0), g = d.y),
        "z" === b && (f = new mono.Vec3(0, 0, 1), g = d.z),
        "-z" === b && (f = new mono.Vec3(0, 0, -1), g = d.z),
        g *= e,
        a.getClient("animated") && (f = f.negate());
        var h = a.getPosition().clone();
        a.setClient("animated", !a.getClient("animated")),
        new twaver.Animate({
            from: 0,
            to: 1,
            dur: 2e3,
            easing: "bounceOut",
            onUpdate: function(b) {
                a.setPosition(h.clone().add(f.clone().multiplyScalar(g * b)))
            },
            onDone: function() {
                demo.animationFinished(a),
                c && c()
            }
        }).play()
    },
    //旋转动画效果
    animateRotate: function(a, b, c, d, e) {
        d = d || "easeInStrong";
        var f = a.getBoundingBox().size().multiply(a.getScale()),
        g = 0,
        h = 1;
        a.getClient("animated") && (h = -1),
        a.setClient("animated", !a.getClient("animated"));
        var i, j;
        if ("left" === b) {
            i = new mono.Vec3( - f.x / 2, 0, 0);
            var j = new mono.Vec3(0, 1, 0)
        }
        if ("right" === b) {
            i = new mono.Vec3(f.x / 2, 0, 0);
            var j = new mono.Vec3(0, 1, 0)
        }
        var k = new twaver.Animate({
            from: g,
            to: h,
            dur: 1500,
            easing: d,
            onUpdate: function(b) {
                void 0 === this.lastValue && (this.lastValue = 0),
                a.rotateFromAxis(j.clone(), i.clone(), Math.PI / 180 * c * (b - this.lastValue)),
                this.lastValue = b
            },
            onDone: function() {
                delete this.lastValue,
                demo.animationFinished(a),
                e && e()
            }
        });
        k.play()
    },
    animationFinished: function(a) {
        var b = a.getClient("animation.done.func");
        b && b()
    },
    getRandomInt: function(a) {
        return parseInt(Math.random() * a)
    },
    getRandomLazyTime: function() {
        var a = demo.LAZY_MAX - demo.LAZY_MIN;
        return demo.getRandomInt(a) + demo.LAZY_MIN
    },

    //物体上印子
    generateAssetImage: function(a) {
        var b = 512,
        c = 256,
        d = document.createElement("canvas");
        d.width = b,
        d.height = c;
        var e = d.getContext("2d");
        return e.fillStyle = "white",
        e.fillRect(0, 0, b, c),
        e.font = '60px "Microsoft Yahei" ',
        e.fillStyle = "black",
        e.textAlign = "start",
        e.textBaseline = "middle",
        e.fillText(a, b / 2, c / 3),
        e.strokeStyle = "blue",
        e.lineWidth = 15,
        e.strokeText(a, b / 2, c / 3),
        d
    },
    //切换温度监控视图
    toggleTemperatureView: function(a) {
        a.temperatureView = !a.temperatureView,
        a.getDataBox().forEach(function(b) {
            var c = b.getClient("type");
            if (("rack" === c || "rack.door" === c) && (b.setVisible(!a.temperatureView), "rack" === c)) {
                if (!b.temperatureFake) {
                    var d = new mono.Cube(b.getWidth(), b.getHeight(), b.getDepth());
                    b.temperatureFake = d;
                    var e = demo.createSideTemperatureImage(b, 3 + 10 * Math.random());
                    d.s({
                        "m.texture.image": e,
                        "top.m.texture.image": b.getStyle("top.m.texture.image"),
                        "top.m.normalmap.image": demo.getRes("metal_normalmap.jpg"),
                        "top.m.specularmap.image": b.getStyle("top.m.texture.image"),
                        "top.m.envmap.image": demo.getEnvMap(),
                        "top.m.type": "phong"
                    }),
                    a.getDataBox().add(d)
                }
                b.temperatureFake.setPosition(b.getPosition()),
                b.temperatureFake.setVisible(a.temperatureView)
            }
        }),
        a.temperatureView ? (demo.createTemperatureBoard(a.getDataBox()), demo.createTemperatureWall(a.getDataBox())) : (a.getDataBox().remove(a.getDataBox().temperaturePlane), delete a.getDataBox().temperaturePlane, a.getDataBox().remove(a.getDataBox().temperatureWall), delete a.getDataBox().temperatureWall)
    },
    //温度热点图界面
    createTemperatureBoard: function(a) {
        var b = a.shadowHost,
        c = new TemperatureBoard(512, 512, "h", 20);
        a.forEach(function(a) {
            var d = a.getClient("type");
            if ("rack" === d) {
                var e = a.getPositionX() / b.getWidth() * 512 + 256,
                f = a.getPositionZ() / b.getDepth() * 512 + 256,
                g = .1 + .3 * Math.random(),
                h = a.getWidth() / b.getWidth() * 512,
                i = a.getDepth() / b.getWidth() * 512;
                c.addPoint(e - h / 2, f + i / 2, g),
                c.addPoint(e + h / 2, f + i / 2, g),
                c.addPoint(e - h / 2, f - i / 2, g),
                c.addPoint(e + h / 2, f - i / 2, g),
                c.addPoint(e, f, g)
            }
        });
        var d = c.getImage(),
        e = new mono.Plane(b.getWidth(), b.getDepth());
        e.s({
            "m.texture.image": d,
            "m.transparent": !0,
            "m.side": mono.DoubleSide,
            "m.type": "phong"
        }),
        e.setPositionY(10),
        e.setRotationX( - Math.PI / 2),
        a.add(e),
        a.temperaturePlane = e
    },
    //温度热点图强
    createTemperatureWall: function(a) {
        var b = new mono.Cube(990, 200, 10);
        b.s({
            "m.visible": !1
        }),
        b.s({
            "front.m.visible": !0,
            "m.texture.image": demo.getRes("temp1.jpg"),
            "m.side": mono.DoubleSide,
            "m.type": "phong"
        }),
        b.setPosition(0, b.getHeight() / 2, 400),
        b.setRotationX(Math.PI),
        a.add(b),
        a.temperatureWall = b
    },
    //温度统计图片
    createSideTemperatureImage: function(a, b) {
        for (var c = 2,
        d = a.getHeight(), e = d / b, f = new TemperatureBoard(c, d, "v", d / b), g = 0; b > g; g++) {
            var h = .3 + .2 * Math.random();
            4 > h && (h = .9 * Math.random()),
            f.addPoint(c / 2, e * g, h)
        }
        return f.getImage()
    },
    //显示可用空间
    toggleSpaceView: function(a) {
        a.spaceView = !a.spaceView,
        a.getDataBox().forEach(function(b) {
            var c = b.getClient("type");
            if (("rack" === c || "rack.door" === c) && (b.setVisible(!a.spaceView), "rack" === c)) {
                b.spaceCubes || (b.spaceCubes = demo.createRackSpaceCubes(a.getDataBox(), b));
                for (var d = 0; d < b.spaceCubes.length; d++) b.spaceCubes[d].setPosition(b.getPositionX(), b.spaceCubes[d].getPositionY(), b.getPositionZ()),
                b.spaceCubes[d].setVisible(a.spaceView)
            }
        })
    },
    //档案柜可用空间模型
    createRackSpaceCubes: function(a, b) {
        for (var c = [], d = b.getWidth(), e = b.getHeight(), f = b.getDepth(), g = 42, h = e / g, i = 0, j = ["#8A0808", "#088A08", "#088A85", "#6A0888", "#B18904"], k = !1; 42 > i;) {
            var l = parseInt(1 + 5 * Math.random());
            k = !k;
            var m = k ? j[l - 1] : "#A4A4A4";
            l *= k ? 2 : 4,
            i + l > g && (l = g - i);
            var n = new mono.Cube(d, h * l - 2, f),
            o = (i + l / 2) * h;
            n.setPosition(b.getPositionX(), o, b.getPositionZ()),
            n.s({
                "m.type": "phong",
                "m.color": m,
                "m.ambient": m,
                "m.specularStrength": 50
            }),
            k && n.s({
                "m.transparent": !0,
                "m.opacity": .6
            }),
            a.add(n),
            c.push(n),
            i += l
        }
        return c
    },
    //档案柜利用情况模型
    toggleUsageView: function(a) {
        a.usageView = !a.usageView,
        a.getDataBox().forEach(function(b) {
            var c = b.getClient("type");
            if (("rack" === c || "rack.door" === c) && (b.setVisible(!a.usageView), "rack" === c)) {
                if (!b.usageFakeTotal) {
                    var d = Math.random(),
                    e = demo.getHSVColor(.7 * (1 - d), .7, .7),
                    f = new mono.Cube(b.getWidth(), b.getHeight(), b.getDepth());
                    b.usageFakeTotal = f,
                    f.s({
                        "m.wireframe": !0,
                        "m.transparent": !0,
                        "m.opacity": .2
                    }),
                    f.setPosition(b.getPosition()),
                    a.getDataBox().add(f);
                    var g = b.getHeight() * d,
                    h = new mono.Cube(b.getWidth(), 0, b.getDepth());
                    b.usageFakeUsed = h,
                    h.s({
                        "m.type": "phong",
                        "m.color": e,
                        "m.ambient": e,
                        "m.specularStrength": 20,
                        "left.m.lightmap.image": demo.getRes("inside_lightmap.jpg"),
                        "right.m.lightmap.image": demo.getRes("inside_lightmap.jpg"),
                        "back.m.lightmap.image": demo.getRes("inside_lightmap.jpg"),
                        "front.m.lightmap.image": demo.getRes("inside_lightmap.jpg")
                    }),
                    h.setPosition(b.getPosition()),
                    h.setPositionY(0),
                    a.getDataBox().add(h);
                    var i = new twaver.Animate({
                        from: 0,
                        to: g,
                        type: "number",
                        dur: 2e3,
                        delay: 200 * Math.random(),
                        easing: "bounceOut",
                        onUpdate: function(a) {
                            h.setHeight(a),
                            h.setPositionY(h.getHeight() / 2)
                        }
                    });
                    b.usageAnimation = i
                }
                b.usageFakeTotal.setVisible(a.usageView),
                b.usageFakeUsed.setVisible(a.usageView),
                b.usageFakeTotal.setPosition(b.getPosition().clone()),
                b.usageFakeUsed.setHeight(0),
                b.usageFakeUsed.setPosition(b.getPosition().clone()),
                b.usageFakeUsed.setPositionY(0),
                a.usageView ? b.usageAnimation.play() : b.usageAnimation.stop()
            }
        })
    },
    //档案馆通风情况模型
    toggleAirView: function(a) {
        a.airView = !a.airView,
        a.getDataBox().airPlanes || (a.getDataBox().airPlanes = demo.createAirPlanes());
        for (var b = 0; b < a.getDataBox().airPlanes.length; b++) {
            var c = a.getDataBox().airPlanes[b];
            a.airView ? (a.getDataBox().add(c), c.airAnimation.play()) : (a.getDataBox().remove(c), c.airAnimation.stop())
        }
    },
    //档案柜移动
    toggleMoveView: function(a) {
        a.getDataBox().getSelectionModel().clearSelection(),
        a.moveView = !a.moveView,
        a.dirtyNetwork()
    },
    //颜色值转换
    getHSVColor: function(a, b, c) {
        var d, e, f, g, h, i, j, k;
        switch (a && void 0 === b && void 0 === c && (b = a.s, c = a.v, a = a.h), g = Math.floor(6 * a), h = 6 * a - g, i = c * (1 - b), j = c * (1 - h * b), k = c * (1 - (1 - h) * b), g % 6) {
        case 0:
            d = c,
            e = k,
            f = i;
            break;
        case 1:
            d = j,
            e = c,
            f = i;
            break;
        case 2:
            d = i,
            e = c,
            f = k;
            break;
        case 3:
            d = i,
            e = j,
            f = c;
            break;
        case 4:
            d = k,
            e = i,
            f = c;
            break;
        case 5:
            d = c,
            e = i,
            f = j
        }
        var l = "#" + this.toHex(255 * d) + this.toHex(255 * e) + this.toHex(255 * f);
        return l
    },
    //转16进制
    toHex: function(a) {
        var b = parseInt(a).toString(16);
        return 1 == b.length && (b = "0" + b),
        b
    },
    //显示对话框
    showDialog: function(a, b, c, d) {
        b = b || "",
        c = c || 600,
        d = d || 400;
        var e = document.getElementById("dialog");
        e && document.body.removeChild(e),
        e = document.createElement("div"),
        e.setAttribute("id", "dialog"),
        e.style.display = "block",
        e.style.position = "absolute",
        e.style.left = "100px",
        e.style.top = "100px",
        e.style.width = c + "px",
        e.style.height = d + "px",
        e.style.background = "rgba(164,186,223,0.75)",
        e.style["border-radius"] = "5px",
        document.body.appendChild(e);
        var f = document.createElement("span");
        f.style.display = "block",
        f.style.color = "white",
        f.style["font-size"] = "13px",
        f.style.position = "absolute",
        f.style.left = "10px",
        f.style.top = "2px",
        f.innerHTML = b,
        e.appendChild(f);
        var g = document.createElement("img");
        g.style.position = "absolute",
        g.style.right = "4px",
        g.style.top = "4px",
        g.setAttribute("src", demo.getRes("close.png")),
        g.onclick = function() {
            document.body.removeChild(e)
        },
        e.appendChild(g),
        a && (a.style.display = "block", a.style.position = "absolute", a.style.left = "3px", a.style.top = "24px", a.style.width = c - 6 + "px", a.style.height = d - 26 + "px", e.appendChild(a))
    },
    //弹出视频播放器界面
    showVideoDialog: function(a) {
        var b = document.createElement("video");
        b.setAttribute("src", demo.getRes("test.mp4")),
        b.setAttribute("controls", "true"),
        b.setAttribute("autoplay", "true"),
        demo.showDialog(b, a, 610, 280)
    },

    createConnectionBillboardImage: function(a) {
        var b = 512,
        c = 256,
        d = "当前网络流量",
        e = document.createElement("canvas");
        e.width = b,
        e.height = c;
        var f = e.getContext("2d");
        f.fillStyle = "#FE642E",
        f.fillRect(0, 0, b, c - c / 6),
        f.beginPath(),
        f.moveTo(.2 * b, 0),
        f.lineTo(b / 2, c),
        f.lineTo(.8 * b, 0),
        f.fill();
        var g = "white";
        f.font = '40px "Microsoft Yahei" ',
        f.fillStyle = g,
        f.textAlign = "left",
        f.textBaseline = "middle",
        f.fillText(d, c / 10, c / 5);
        var g = "white";
        return d = a,
        f.font = '100px "Microsoft Yahei" ',
        f.fillStyle = g,
        f.textAlign = "left",
        f.textBaseline = "middle",
        f.fillText(d, c / 10, c / 2),
        f.strokeStyle = g,
        f.lineWidth = 4,
        f.strokeText(d, c / 10, c / 2),
        d = "Mb/s",
        f.font = '50px "Microsoft Yahei" ',
        f.fillStyle = g,
        f.textAlign = "right",
        f.textBaseline = "middle",
        f.fillText(d, b - c / 10, c / 2 + 20),
        e
    },

    inspection: function(a) {
        var b, c, d;
        a.getDataBox().forEach(function(a) {
            "left-door" === a.getClient("type") && (b = a),
            "right-door" === a.getClient("type") && (c = a),
            "1" === a.getClient("label") || (d = a)
        });
        var e = [{
            px: 2e3,
            py: 500,
            pz: 2e3,
            tx: 0,
            ty: 0,
            tz: 0
        },
        {
            px: 2e3,
            pz: -2e3
        },
        {
            px: 0,
            pz: -2500
        },
        {
            px: -2e3
        },
        {
            px: -2500,
            pz: 0
        },
        {
            pz: 2e3
        },
        {
            px: -1200,
            tx: -350,
            ty: 170,
            tz: 500
        },
        {
            px: -550,
            py: 190,
            pz: 1100
        }],
        f = [{
            px: -350,
            py: 120,
            pz: 600,
            tx: -340,
            ty: 150,
            tz: -300
        },
        {
            py: 100,
            pz: 200
        },
        {
            px: -300,
            py: 300,
            pz: 150,
            ty: 70
        }],
        g = function(b) {
            var c = b.alarmCard,
            d = c.getWorldPosition(),
            e = [{
                px: d.x,
                py: d.y,
                pz: d.z + 120,
                tx: d.x,
                ty: d.y + 10,
                tz: d.z
            },
            {
                px: d.x - 30,
                py: d.y + 30,
                pz: d.z + 90,
                ty: d.y + 15
            }];
            mono.AniUtil.playInspection(a, e,
            function() {
                demo.playAnimation(c, c.getClient("animation"),
                function() {
                    a.inspecting = !1,
                    demo.showAlarmDialog()
                })
            })
        };
        d.setClient("loaded.func", g);
        var h = function() {
            demo.playAnimation(b, b.getClient("animation"),
            function() {
                mono.AniUtil.playInspection(a, f,
                function() {
                    var a = d.door;
                    demo.playAnimation(a, a.getClient("animation"))
                })
            }),
            demo.playAnimation(c, c.getClient("animation"))
        };
        mono.AniUtil.playInspection(a, e, h)
    },
    //闹钟提示对话框
    showAlarmDialog: function() {
        var a = document.createElement("span");
        a.style["background-color"] = "rgba(255,255,255,0.85)",
        a.style.padding = "10px",
        a.style.color = "darkslategrey",
        a.innerHTML = "<b>告警描述</b><p>中兴S330板卡有EPE1，LP1，OL16，CSB,SC，EPE1（2M电口）与LP1（155M光）与用户路由器连接。EPE1上发生TU-AIS ,TU-LOP，UNEQ，误码秒告警，所配业务均出现，用户路由器上出现频繁up，down告警。用户路由器上与1块LP1（有vc12级别的交叉）连接的cpos板卡上也有频繁up，down告警，与另一块LP1（vc4穿通）连接的cpos卡上无告警</p><b>故障分析</b><p>情况很多。如果只是单站出现，首先判断所属环上保护，主用光路有没有告警；如果有，解决主用线路问题；如果没有，做交叉板主备切换--当然是在晚上进行；很少出现主备交叉板都坏的情况。还没解决的话，依次检查单板和接口板。</p>",
        demo.showDialog(a, "SDH 2M支路板告警", 510, 250),
        a.style.width = "484px",
        a.style.height = "203px"
    },
    toggleLinkVisible: function(a) {},
    //重置
    resetView: function(a) {
        demo.resetCamera(a);
        var b = [];
        a.getDataBox().forEach(function(a) {
            "rack" === a.getClient("type") && a.oldRack && b.push(a)
        });
        for (var c = 0; c < b.length; c++) {
            var d = b[c],
            e = d.oldRack;
            d.alarm && a.getDataBox().getAlarmBox().remove(d.alarm),
            a.getDataBox().removeByDescendant(d, !0),
            a.getDataBox().add(e),
            e.alarm && a.getDataBox().getAlarmBox().add(e.alarm),
            e.door.setParent(e),
            e.setClient("loaded", !1);
            var f = e.door;
            a.getDataBox().add(f),
            f.getClient("animated") && demo.playAnimation(f, f.getClient("animation"))
        }
        var g = [];
        a.getDataBox().forEach(function(a) { ("left-door" === a.getClient("type") || "right-door" === a.getClient("type")) && g.push(a)
        });
        for (var c = 0; c < g.length; c++) {
            var f = g[c];
            f.getClient("animated") && demo.playAnimation(f, f.getClient("animation"))
        }
        a.temperatureView && demo.toggleTemperatureView(a),
        a.spaceView && demo.toggleSpaceView(a),
        a.usageView && demo.toggleUsageView(a),
        a.airView && demo.toggleAirView(a),
        a.moveView && demo.toggleMoveView(a),
        a.connectionView && demo.toggleConnectionView(a),
        a.smokeView && demo.toggleSmokeView(a),
        a.waterView && demo.toggleWaterView(a),
        a.laserView && demo.toggleLaserView(a),
        a.powerView && demo.togglePowerView(a)
    },
    //重置档案柜的位置
    resetRackPosition: function(a) {
        a.getDataBox().forEach(function(a) {
            "rack" === a.getClient("type") && a.setPosition(a.getClient("origin"))
        }),
        demo.dirtyShadowMap(a)
    },
    //密码门锁点击弹出对话框
    showDoorTable: function() {
        var a = document.createElement("table");
        a.setAttribute("class", "gridtable");
        for (var b = 0; 8 > b; b++) {
            var c = document.createElement("tr");
            a.appendChild(c);
            for (var d = 0; 3 > d; d++) {
                var e = 0 == b ? "th": "td",
                f = document.createElement(e);
                c.appendChild(f),
                0 == b ? (0 == d && (f.innerHTML = "#"), 1 == d && (f.innerHTML = "Time"), 2 == d && (f.innerHTML = "Activity")) : (0 == d && (f.innerHTML = parseInt(1e3 * Math.random())), 1 == d && (f.innerHTML = (new Date).format("yyyy h:mm")), 2 == d && (Math.random() > .5 ? f.innerHTML = "Door access allowed": f.innerHTML = "Instant Alart - Door access denied"))
            }
        }
        demo.showDialog(a, "Door Security Records", 330, 240)
    },

    toggleSmokeView: function(a) {
        a.smokeView = !a.smokeView,
        a.getDataBox().forEach(function(b) {
            var c = b.getClient("type"); ("smoke" === c || "extinguisher_arrow" === c) && b.setVisible(a.smokeView)
        })
    },
    startSmokeAnimation: function(a) {
        setInterval(demo.updateSmoke(a), 200)
    },
    //启动EPS动画
    startFpsAnimation: function(a) {
        var b = document.createElement("span");
        b.style.display = "block",
        b.style.color = "white",
        b.style["font-size"] = "10px",
        b.style.position = "absolute",
        b.style.left = "10px",
        b.style.top = "10px",
        b.style.visibility = "hidden",
        document.body.appendChild(b),
        a.fpsDiv = b,
        demo.fps = 0,
        a.setRenderCallback(function() {
            demo.fps++
        }),
        setInterval(demo.updateFps(a), 1e3)
    },
    toggleFpsView: function(a) {
        a.fpsView = !a.fpsView,
        a.fpsView ? a.fpsDiv.style.visibility = "inherit": a.fpsDiv.style.visibility = "hidden"
    },
    updateSmoke: function(a) {
        return function() {
            a.smokeView && a.getDataBox().forEach(function(b) {
                if ("smoke" === b.getClient("type") && b.isVisible()) {
                    for (var c = b,
                    d = c.vertices.length,
                    e = 0; d > e; e++) {
                        var f = c.vertices[e];
                        f.y = 200 * Math.random(),
                        f.x = Math.random() * f.y / 2 - f.y / 4,
                        f.z = Math.random() * f.y / 2 - f.y / 4
                    }
                    c.verticesNeedUpdate = !0,
                    a.dirtyNetwork()
                }
            })
        }
    },
    updateFps: function(a) {
        return function() {
            a.fpsDiv.innerHTML = "FPS:  " + demo.fps,
            demo.fps = 0
        }
    },
    toggleWaterView: function(a) {
        if (a.waterView = !a.waterView, a.waterView) demo.createWaterLeaking(a.getDataBox()),
        a.getDataBox().oldAlarms = a.getDataBox().getAlarmBox().toDatas(),
        a.getDataBox().getAlarmBox().clear();
        else {
            if (a.getDataBox().waterLeakingObjects) for (var b = 0; b < a.getDataBox().waterLeakingObjects.length; b++) a.getDataBox().remove(a.getDataBox().waterLeakingObjects[b]);
            a.getDataBox().oldAlarms.forEach(function(b) {
                a.getDataBox().getAlarmBox().add(b)
            })
        }
        a.getDataBox().forEach(function(b) {
            var c = b.getClient("type");
            "water_cable" === c ? b.setVisible(a.waterView) : c && "floorCombo" !== c && "extinguisher" !== c && "glassWall" !== c && (a.waterView ? "rack" === c || "rack_door" === c ? (b.oldTransparent = b.getStyle("m.transparent"), b.oldOpacity = b.getStyle("m.opacity"), b.setStyle("m.transparent", !0), b.setStyle("m.opacity", .1)) : (b.oldVisible = b.isVisible(), b.setVisible(!1)) : "rack" === c || "rack_door" === c ? (b.setStyle("m.transparent", b.oldTransparent), b.setStyle("m.opacity", b.oldOpacity)) : b.setVisible(b.oldVisible))
        })
    },
    createWaterLeaking: function(a) {
        var b = new mono.Billboard;
        b.s({
            "m.texture.image": demo.getRes("alert.png"),
            "m.vertical": !0
        }),
        b.setScale(80, 160, 1),
        b.setPosition(50, 90, 50),
        a.add(b);
        var c = new mono.Sphere(30);
        c.s({
            "m.transparent": !0,
            "m.opacity": .8,
            "m.type": "phong",
            "m.color": "#58FAD0",
            "m.ambient": "#81BEF7",
            "m.specularStrength": 50,
            "m.normalmap.image": demo.getRes("rack_inside_normal.jpg")
        }),
        c.setPosition(50, 0, 50),
        c.setScale(1, .1, .7),
        a.add(c),
        a.waterLeakingObjects = [b, c]
    },
    toggleLaserView: function(a) {
        a.laserView = !a.laserView,
        a.getDataBox().forEach(function(b) {
            "laser" === b.getClient("type") && b.setVisible(a.laserView)
        })
    },
    setupControlBar: function(a) {
        var b = document.createElement("div");
        b.setAttribute("id", "toolbar"),
        b.style.display = "block",
        b.style.position = "absolute",
        b.style.left = "20px",
        b.style.top = "10px",
        b.style.width = "auto",
        document.body.appendChild(b)
    },
    setupToolbar: function(a) {
        var b = a.length,
        c = 32,
        d = document.createElement("div");
        d.setAttribute("id", "toolbar"),
        d.style.display = "block",
        d.style.position = "absolute",
        d.style.left = "10px",
        d.style.top = "75px",
        d.style.width = "32px",
        d.style.height = b * c + c + "px",
        d.style.background = "rgba(255,255,255,0.75)",
        d.style["border-radius"] = "5px",
        document.body.appendChild(d);
        for (var e = 0; b > e; e++) {
            var f = a[e],
            g = f.icon,
            h = document.createElement("img");
            h.style.position = "absolute",
            h.style.left = "4px",
            h.style.top = c / 2 + e * c + "px",
            h.style["pointer-events"] = "auto",
            h.style.cursor = "pointer",
            h.setAttribute("src", demo.getRes(g)),
            h.style.width = "24px",
            h.style.height = "24px",
            h.setAttribute("title", f.label),
            h.onclick = f.clickFunction,
            d.appendChild(h)
        }
    },
    togglePowerView: function(a) {
        a.powerLineCreated || demo.createPowerLines(a),
        a.powerView = !a.powerView,
        a.getDataBox().forEach(function(b) {
            var c = b.getClient("type");
            "power_line" === c && b.setVisible(a.powerView)
        })
    },
    createPowerLines: function(a) {
        var b = a.getDataBox(),
        c = function(a, c) {
            b.forEach(function(d) {
                if ("rack" === d.getClient("type")) {
                    var e = d.getClient("label");
                    if (a.indexOf(e) > -1) {
                        var f = d.getPosition(),
                        g = [];
                        g.push([f.x, f.y, f.z]),
                        g.push([f.x, f.y, f.z - 60]),
                        g.push([f.x, 240, f.z - 60]),
                        g.push([f.x, 240, c]),
                        g.push([ - 550, 240, c]),
                        demo.createPathLink(b, g, "#FE9A2E", "power_line");
                        var g = [];
                        g.push([f.x - 5, f.y, f.z]),
                        g.push([f.x - 5, f.y, f.z - 60]),
                        g.push([f.x - 5, 250, f.z - 60]),
                        g.push([f.x - 5, 250, c]),
                        g.push([ - 550, 250, c]),
                        demo.createPathLink(b, g, "cyan", "power_line"),
                        c -= 5
                    }
                }
            })
        };
        c(["1A07", "1A08", "1A09", "1A10", "1A11", "1A12", "1A13"], 150),
        c(["1A00", "1A01", "1A02"], 160),
        c(["1A03", "1A04", "1A05", "1A06"], -300),
        demo.createPathLink(b, [[ - 1e3, 420, 600], [ - 800, 250, 500], [ - 550, 250, 500], [ - 550, 250, -315]], "cyan", "power_line"),
        demo.createPathLink(b, [[ - 1e3, 410, 600], [ - 800, 240, 500], [ - 550, 240, 500], [ - 550, 240, -315]], "#FE9A2E", "power_line")
    },
    createPathLink: function(a, b, c, d) {
        if (b && b.length > 1) {
            c = c || "white";
            for (var e = 1; e < b.length; e++) {
                var f = b[e - 1],
                g = b[e],
                h = new mono.Cube(.001, .001, .001);
                h.s({
                    "m.color": c
                }),
                h.setPosition(f[0], f[1], f[2]),
                h.setClient("type", d),
                a.add(h);
                var i = h.clone();
                i.setPosition(g[0], g[1], g[2]),
                i.setClient("type", d),
                a.add(i);
                var j = new mono.Link(h, i);
                j.s({
                    "m.color": c
                }),
                j.setClient("type", d),
                a.add(j)
            }
        }
    }
};


// 绘制地板
demo.registerFilter("floor",
function(a, b) {
    return {
        type: "cube",
        width: 1e3,
        height: 10,
        depth: 1e3,
        translate: [0, -10, 0],
        shadowHost: !0,
        op: "+",
        style: {
            "m.type": "phong",
            "m.color": "#BEC9BE",
            "m.ambient": "#BEC9BE",
            "top.m.type": "basic",
            "top.m.texture.image": demo.getRes("floor.jpg"),
            "top.m.texture.repeat": new mono.Vec2(10, 10),
            "top.m.color": "#DAF0F5",
            "top.m.polygonOffset": !0,
            "top.m.polygonOffsetFactor": 3,
            "top.m.polygonOffsetUnits": 3
        }
    }
}),

demo.registerFilter("floor_cut",
function(a, b) {
    return {
        type: "cube",
        width: 100,
        height: 100,
        depth: 100,
        op: "-",
        style: {
            "m.texture.image": demo.getRes("floor.jpg"),
            "m.texture.repeat": new mono.Vec2(4, 4),
            "m.color": "#DAF0F5",
            "m.lightmap.image": demo.getRes("outside_lightmap.jpg"),
            "m.polygonOffset": !0,
            "m.polygonOffsetFactor": 3,
            "m.polygonOffsetUnits": 3
        }
    }
}),
demo.registerFilter("floor_box",
function(a, b) {
    return {
        type: "cube",
        width: 100,
        height: 100,
        depth: 100,
        shadow: !0,
        sideColor: "#C3D5EE",
        topColor: "#D6E4EC",
        client: {
            type: "floor_box"
        }
    }
}),
demo.registerFilter("plants",
function(a, b) {
    var c = [],
    d = b.translates;
    if (d) for (var e = 0; e < d.length; e++) {
        var f = d[e],
        g = {
            type: "plant",
            shadow: !0,
            translate: f
        };
        demo.copyProperties(b, g, ["type", "translates", "translate"]),
        c.push(g)
    }
    return c
}),
demo.registerFilter("racks",
function(a, b) {
    var c = [],
    d = b.translates,
    e = b.severities || [],
    f = b.labels || [];
    if (d) for (var g = 0; g < d.length; g++) {
        var h = d[g],
        i = e[g],
        j = f[g] || "",
        k = {
            type: "rack",
            shadow: !0,
            translate: h,
            severity: i,
            label: j
        };
        demo.copyProperties(b, k, ["type", "translates", "translate", "severities"]),
        c.push(k)
    }
    return c
}),
demo.registerFilter("wall",
function(a, b) {
    var c = [],
    d = {
        type: "path",
        op: "+",
        width: 20,
        height: 200,
        shadow: !0,
        insideColor: "#B8CAD5",
        outsideColor: "#A5BDDD",
        topColor: "#D6E4EC",
        translate: b.translate,
        data: b.data,
        client: {
            data: b.data,
            type: "wall",
            translate: b.translate
        }
    };
    if (c.push(d), b.children) {
        var e = demo.filterJson(a, b.children);
        c = c.concat(e)
    }
    for (var f = [], g = [], h = 0; h < c.length; h++) {
        var i = c[h];
        i.op ? f.push(i) : g.push(i)
    }
    var j = demo.createCombo(f);
    return j.shadow = !0,
    j.setClient("data", b.data),
    j.setClient("type", "wall"),
    j.setClient("translate", b.translate),
    a.add(j),
    g
}),
demo.registerFilter("window",
function(a, b) {
    var c = b.translate || [0, 0, 0],
    d = c[0],
    e = c[1],
    f = c[2],
    g = b.width || 100,
    h = b.height || 100,
    i = b.depth || 50,
    j = 2,
    k = 5,
    l = 45,
    m = 10;
    return [{
        type: "cube",
        width: g,
        height: h,
        depth: i,
        translate: [d, e, f],
        op: "-",
        sideColor: "#B8CAD5",
        topColor: "#D6E4EC"
    },
    {
        type: "cube",
        width: g - .5,
        height: h - .5,
        depth: j,
        translate: [d, e, f],
        op: "+",
        style: {
            "m.color": "#58ACFA",
            "m.ambient": "#58ACFA",
            "m.type": "phong",
            "m.specularStrength": .1,
            "m.envmap.image": demo.getEnvMap(),
            "m.specularmap.image": demo.getRes("rack_inside_normal.jpg"),
            "m.texture.repeat": new mono.Vec2(10, 5),
            "front.m.transparent": !0,
            "front.m.opacity": .4,
            "back.m.transparent": !0,
            "back.m.opacity": .4
        }
    },
    {
        type: "cube",
        width: g,
        height: k,
        depth: l,
        translate: [d, e, f + m],
        op: "+",
        sideColor: "#A5BDDD",
        topColor: "#D6E4EC"
    }]
}),
demo.registerFilter("door",
function(a, b) {
    var c = b.translate || [0, 0, 0],
    d = c[0],
    e = c[1],
    f = c[2],
    g = b.width || 205,
    h = b.height || 180,
    i = b.depth || 26,
    j = 10,
    k = 2;
    return [{
        type: "cube",
        width: g,
        height: h,
        depth: i,
        translate: [d, e, f],
        op: "+",
        sideColor: "#C3D5EE",
        topColor: "#D6E4EC"
    },
    {
        type: "cube",
        width: g - j,
        height: h - j / 2 - k,
        depth: i + 2,
        op: "-",
        translate: [d, e + k, f],
        sideColor: "#B8CAD5",
        topColor: "#D6E4EC"
    },
    {
        type: "cube",
        width: (g - j) / 2 - 2,
        height: h - j / 2 - k - 2,
        depth: 2,
        translate: [d - (g - j) / 4, k + 1, f],
        sideColor: "orange",
        topColor: "orange",
        style: {
            "m.type": "phong",
            "m.transparent": !0,
            "front.m.texture.image": demo.getRes("door_left.png"),
            "back.m.texture.image": demo.getRes("door_right.png"),
            "m.specularStrength": 100,
            "m.envmap.image": demo.getEnvMap(),
            "m.specularmap.image": demo.getRes("white.png")
        },
        client: {
            animation: "rotate.left.-90.bounceOut",
            type: "left-door"
        }
    },
    {
        type: "cube",
        width: (g - j) / 2 - 2,
        height: h - j / 2 - k - 2,
        depth: 2,
        translate: [d + (g - j) / 4, k + 1, f],
        sideColor: "orange",
        topColor: "orange",
        style: {
            "m.type": "phong",
            "m.transparent": !0,
            "front.m.texture.image": demo.getRes("door_right.png"),
            "back.m.texture.image": demo.getRes("door_left.png"),
            "m.specularStrength": 100,
            "m.envmap.image": demo.getEnvMap(),
            "m.specularmap.image": demo.getRes("white.png")
        },
        client: {
            animation: "rotate.right.90.bounceOut",
            type: "right-door"
        }
    },
    {
        type: "cube",
        width: 15,
        height: 32,
        depth: i - 3,
        translate: [d - g / 2 - 13, .6 * h, f],
        style: {
            "left.m.visible": !1,
            "right.m.visible": !1,
            "top.m.visible": !1,
            "bottom.m.visible": !1,
            "m.transparent": !0,
            "m.specularStrength": 50,
            "front.m.texture.image": demo.getRes("lock.png"),
            "back.m.texture.image": demo.getRes("lock.png")
        },
        client: {
            "dbl.func": demo.showDoorTable,
            type: "door_lock"
        }
    }]
}),
demo.registerFilter("glass_wall",
function(a, b) {
    var c = b.translate || [0, 0, 0],
    d = c[0],
    e = c[1],
    f = c[2],
    g = b.width || 100,
    h = b.height || 200,
    i = b.depth || 20,
    j = .6 * h,
    k = b.rotate || [0, 0, 0],
    l = [{
        type: "cube",
        width: g,
        height: h,
        depth: i,
        shadow: !0,
        translate: [d, e, f],
        rotate: k,
        op: "+",
        sideColor: "#A5BDDD",
        topColor: "#D6E4EC"
    },
    {
        type: "cube",
        width: g + 2,
        height: j,
        depth: i + 2,
        translate: [d, (h - j) / 3 * 2, f],
        rotate: k,
        op: "-",
        sideColor: "#A5BDDD",
        topColor: "#D6E4EC"
    },
    {
        type: "cube",
        width: g,
        height: j,
        depth: 4,
        translate: [d, (h - j) / 3 * 2, f],
        rotate: k,
        op: "+",
        sideColor: "#58ACFA",
        topColor: "#D6E4EC",
        style: {
            "m.transparent": !0,
            "m.opacity": .6,
            "m.color": "#01A9DB",
            "m.ambient": "#01A9DB",
            "m.type": "phong",
            "m.specularStrength": 100,
            "m.envmap.image": demo.getEnvMap(),
            "m.specularmap.image": demo.getRes("rack_inside_normal.jpg"),
            "m.texture.repeat": new mono.Vec2(30, 5)
        }
    }],
    m = demo.createCombo(l);
    m.setClient("type", "glassWall"),
    m.setClient("size", m.getBoundingBox().size()),
    m.setClient("translate", c),
    m.shadow = !0,
    a.add(m)
}),

demo.registerFilter("rail",
function(a, b) {
    var c = {
        type: "path",
        width: 50,
        height: 8,
        data: b.data
    },
    d = function(a, b) {
        a.add(demo.createRail(b))
    },
    e = function(a, b) {
        return function() {
            d(a, b)
        }
    };
    setTimeout(e(a, c), demo.getRandomLazyTime())
}),

demo.createRail = function(a) {
    var b = demo.createPathObject(a);
    return b.s({
        "m.texture.image": demo.getRes("rail.png"),
        "m.type": "phong",
        "m.transparent": !0,
        "m.color": "#CEECF5",
        "m.ambient": "#CEECF5",
        "aside.m.visible": !1,
        "zside.m.visible": !1,
        "m.specularStrength": 50
    }),
    b.setPositionY(263),
    b.setClient("type", "rail"),
    b.setVisible(!1),
    b
},
demo.registerFilter("connection",
function(a, b) {
    var c = demo.create3DPath(b.data);
    c = mono.PathNode.prototype.adjustPath(c, 5);
    var d = b.color,
    e = b.flow,
    f = b.y,
    g = function(a, b, c, d, e) {
        a.add(demo.createConnection(b, c, d, e))
    },
    h = function(a, b, c, d, e) {
        return function() {
            g(a, b, c, d, e)
        }
    };
    setTimeout(h(a, c, d, e, f), demo.getRandomLazyTime())
}),
demo.createConnection = function(a, b, c, d) {
    var e = new mono.PathNode(a, 100, 1);
    return e.s({
        "m.type": "phong",
        "m.specularStrength": 30,
        "m.color": b,
        "m.ambient": b,
        "m.texture.image": demo.getRes("flow.jpg"),
        "m.texture.repeat": new mono.Vec2(200, 1),
        "m.texture.flipX": c > 0
    }),
    e.setClient("flow", c),
    e.setStartCap("plain"),
    e.setEndCap("plain"),
    e.setPositionY(d),
    e.setClient("type", "connection"),
    e.setVisible(!1),
    e
},

demo.registerShadowPainter("wall",
function(a, b, c, d, e, f) {
    var e = a.getClient("translate") || [0, 0, 0],
    g = c / 2 + e[0],
    h = d - (d / 2 + e[2]),
    i = a.getClient("data");
    b.save(),
    b.translate(g, h),
    b.rotate(f),
    b.beginPath();
    for (var j = !0,
    k = 0; k < i.length; k++) {
        var l = i[k];
        j ? (b.moveTo(l[0], -l[1]), j = !1) : b.lineTo(l[0], -l[1])
    }
    b.lineWidth = a.getClient("width") || 20,
    b.strokeStyle = "white",
    b.shadowColor = "#222222",
    b.shadowBlur = 60,
    b.shadowOffsetX = 0,
    b.shadowOffsetY = 0,
    b.stroke(),
    b.restore()
}),
demo.registerShadowPainter("floor_box",
function(a, b, c, d, e, f) {
    var g = c / 2 + e.x,
    h = d / 2 + e.z,
    i = a.getWidth(),
    j = a.getDepth();
    b.save(),
    b.translate(g, h),
    b.rotate(f),
    b.beginPath(),
    b.moveTo( - i / 2, 0),
    b.lineTo(i / 2, 0),
    b.lineWidth = j,
    b.strokeStyle = "white",
    b.shadowColor = "#222222",
    b.shadowBlur = 60,
    b.shadowOffsetX = 0,
    b.shadowOffsetY = 0,
    b.stroke(),
    b.restore()
}),

demo.registerShadowPainter("rack",
function(a, b, c, d, e, f) {
    var g = c / 2 + e.x,
    h = d / 2 + e.z,
    i = a.width || 60,
    j = (a.height || 200, a.depth || 80),
    i = .99 * i,
    k = .99 * j;
    b.save(),
    b.beginPath(),
    b.moveTo(g - i / 2, h),
    b.lineTo(g + i / 2, h),
    b.lineWidth = k,
    b.strokeStyle = "gray",
    b.shadowColor = "black",
    b.shadowBlur = 100,
    b.shadowOffsetX = 0,
    b.shadowOffsetY = 0,
    b.stroke(),
    b.restore()
}),
demo.createRoundShadowPainter = function(a) {
    return function(b, c, d, e, f, g) {
        var h = d / 2 + f.x,
        i = e / 2 + f.z;
        c.save(),
        c.beginPath(),
        c.arc(h, i, a, 0, 2 * Math.PI, !1),
        c.fillStyle = "black",
        c.shadowColor = "black",
        c.shadowBlur = 25,
        c.shadowOffsetX = 0,
        c.shadowOffsetY = 0,
        c.fill(),
        c.restore()
    }
},
demo.registerShadowPainter("plant", demo.createRoundShadowPainter(11)),
demo.registerShadowPainter("extinguisher", demo.createRoundShadowPainter(7)),
demo.registerShadowPainter("glassWall",
function(a, b, c, d, e, f) {
    var e = a.getClient("translate"),
    g = a.getClient("size"),
    h = c / 2 + e[0],
    i = d / 2 + e[2],
    j = g.x,
    k = g.z;
    b.save(),
    b.translate(h, i),
    b.beginPath(),
    b.moveTo( - j / 2, 0),
    b.lineTo(j / 2, 0),
    b.lineWidth = k,
    b.strokeStyle = "white",
    b.shadowColor = "#222222",
    b.shadowBlur = 60,
    b.shadowOffsetX = 0,
    b.shadowOffsetY = 0,
    b.stroke(),
    b.restore()
}),

demo.registerCreator("rack",
function(a, b) {
    var c = b.translate || [0, 0, 0],
    d = c[0],
    e = c[1],
    f = c[2],
    g = b.width || 190,
    h = b.height || 180,
    i = b.depth || 80,
    j = b.severity,
    k = b.label,
    l = b.shadow,
    m = new mono.Cube(g, h, i);
    m.s({
        "m.color": "#557E7A",
        "left.m.lightmap.image": demo.getRes("outside_lightmap.jpg"),
        "right.m.lightmap.image": demo.getRes("outside_lightmap.jpg"),
        "front.m.lightmap.image": demo.getRes("outside_lightmap.jpg"),
        "back.m.lightmap.image": demo.getRes("outside_lightmap.jpg"),
        "top.m.normalmap.image": demo.getRes("metal_normalmap.jpg"),
        "left.m.normalmap.image": demo.getRes("metal_normalmap.jpg"),
        "right.m.normalmap.image": demo.getRes("metal_normalmap.jpg"),
        "back.m.normalmap.image": demo.getRes("metal_normalmap.jpg"),
        "top.m.specularmap.image": demo.getRes("outside_lightmap.jpg"),
        "left.m.specularmap.image": demo.getRes("outside_lightmap.jpg"),
        "right.m.specularmap.image": demo.getRes("outside_lightmap.jpg"),
        "back.m.specularmap.image": demo.getRes("outside_lightmap.jpg"),
        "top.m.envmap.image": demo.getEnvMap(),
        "left.m.envmap.image": demo.getEnvMap(),
        "right.m.envmap.image": demo.getEnvMap(),
        "back.m.envmap.image": demo.getEnvMap(),
        "m.ambient": "#557E7A",
        "m.type": "phong",
        "m.specularStrength": 50,
        "front.m.texture.image": demo.getRes("rack.jpg"),
        "front.m.texture.repeat": new mono.Vec2(1, 1),
        "front.m.specularmap.image": demo.getRes("white.png"),
        "front.m.color": "#666",
        "front.m.ambient": "#666",
        "front.m.specularStrength": 200
    }),
    m.setPosition(d, h / 2 + 1 + e, f);
    var n = demo.generateAssetImage(k);
    m.setStyle("right.m.lightmap.image", n),
    m.setStyle("right.m.specularmap.image", n),
    m.setClient("label", k),
    m.setClient("type", "rack"),
    m.setClient("origin", m.getPosition().clone()),
    m.setClient("loaded", !1),
    m.shadow = l;
    var o = new mono.Cube(g, h, 2);
    o.s({
        "m.type": "phong",
        "m.color": "#A5F1B5",
        "m.ambient": "#A4F4EC",
        "front.m.texture.image": demo.getRes("rack_front_door.jpg"),
        "back.m.texture.image": demo.getRes("rack_door_back.jpg"),
        "m.envmap.image": demo.getEnvMap()
    }),
    o.setParent(m),
    m.door = o,
    o.setPosition(0, 0, i / 2 + 1),
    o.setClient("animation", "rotate.right.100"),
    o.setClient("type", "rack.door"),
    o.setClient("animation.done.func",
    function() {
        if (!m.getClient("loaded") && o.getClient("animated")) {
            var b = m.clone();
            b.s({
                "m.color": "red",
                "m.ambient": "red",
                "m.texture.image": null,
                "top.m.normalmap.image": demo.getRes("outside_lightmap.jpg"),
                "top.m.specularmap.image": demo.getRes("white.png")
            }),
            b.setDepth(b.getDepth() - 2),
            b.setWidth(b.getWidth() - 2),
            a.add(b),
            m.s({
                "m.transparent": !0,
                "m.opacity": .5
            }),
            new twaver.Animate({
                from: 0,
                to: b.getHeight(),
                dur: 2e3,
                easing: "easeOut",
                onUpdate: function(a) {
                    b.setHeight(a),
                    b.setPositionY(a / 2)
                },
                onDone: function() {
                    a.remove(b),
                    m.s({
                        "m.transparent": !1,
                        "m.opacity": 1
                    });
                    var c = m.getClient("rack.loader");
                    c && o.getClient("animated") && !m.getClient("loaded") && (c(), m.setClient("loaded", !0), m.getClient("loaded.func") && m.getClient("loaded.func")(m))
                }
            }).play()
        }
    });
    var p = function(a, b, c, d, e, f, g) {
        var h = new mono.Cube(.75 * b, c - 10, .7 * d);
        h.s({
            "m.color": "#333333",
            "m.ambient": "#333333",
            "m.lightmap.image": demo.getRes("inside_lightmap.jpg"),
            "bottom.m.texture.repeat": new mono.Vec2(2, 2),
            "left.m.texture.image": demo.getRes("rack_panel.jpg"),
            "right.m.texture.image": demo.getRes("rack_panel.jpg"),
            "back.m.texture.image": demo.getRes("rack_panel.jpg"),
            "back.m.texture.repeat": new mono.Vec2(1, 1),
            "top.m.lightmap.image": demo.getRes("floor.jpg")
        }),
        h.setPosition(0, 0, d / 2 - h.getDepth() / 2 + 1),
        a.remove(f),
        f.alarm && a.getAlarmBox().remove(f.alarm);
        var i = f.clone();
        i.p(0, 0, 0);
        var j = new mono.ComboNode([i, h], ["-"]),
        k = f.getPosition().x,
        m = f.getPosition().y,
        n = f.getPosition().z;
        if (j.p(k, m, n), j.setClient("type", "rack"), j.oldRack = f, f.newRack = j, j.shadow = l, a.add(j), e) {
            var o = new mono.Alarm(j.getId(), j.getId(), e);
            j.setStyle("alarm.billboard.vertical", !0),
            j.alarm = o,
            a.getAlarmBox().add(o)
        }
        var p = f.getChildren();
        p.forEach(function(a) { ! a || a instanceof mono.Billboard || a.setParent(j)
        }),
        demo.loadRackContent(a, k, m, n, b, c, d, e, i, h, g, j, f)
    };
    if (a.add(m), a.add(o), j) {
        var q = new mono.Alarm(m.getId(), m.getId(), j);
        m.setStyle("alarm.billboard.vertical", !0),
        m.alarm = q,
        a.getAlarmBox().add(q)
    }
    var r = function() {
        p(a, g, h, i, j, m, b)
    };
    m.setClient("rack.loader", r)
}),
demo.registerCreator("plant",
function(a, b) {
    var c = b.scale || [1, 1, 1],
    d = (c[0], c[1], c[2], b.shadow),
    e = b.translate || [0, 0, 0],
    f = (e[0], e[1], e[2],
    function(b, c, e, f, g, h) {
        var i = demo.createPlant(b, c, e, f, g, h);
        i.shadow = d,
        a.add(i)
    }),
    g = function(a, b, c, d, e, g) {
        return function() {
            f(a, b, c, d, e, g)
        }
    };
    setTimeout(g(e[0], e[1], e[2], c[0], c[1], c[2]), demo.getRandomLazyTime())
}),
demo.registerCreator("tv",
function(a, b) {
    var c = b.translate || [0, 0, 0],
    d = c[0],
    e = c[1],
    f = c[2],
    g = 4,
    h = 2,
    i = b.picture || demo.getRes("tv.jpg"),
    j = b.rotate || [0, 0, 0],
    k = [{
        type: "cube",
        width: 150,
        height: 80,
        depth: 5,
        translate: [d, e, f],
        rotate: j,
        op: "+",
        style: {
            "m.type": "phong",
            "m.color": "#2D2F31",
            "m.ambient": "#2D2F31",
            "m.normalmap.image": demo.getRes("metal_normalmap.jpg"),
            "m.texture.repeat": new mono.Vec2(10, 6),
            "m.specularStrength": 20
        }
    },
    {
        type: "cube",
        width: 130,
        height: 75,
        depth: 5,
        translate: [d, e + h, f + g],
        rotate: j,
        op: "-",
        style: {
            "m.type": "phong",
            "m.color": "#2D2F31",
            "m.ambient": "#2D2F31",
            "m.normalmap.image": demo.getRes("metal_normalmap.jpg"),
            "m.texture.repeat": new mono.Vec2(10, 6),
            "m.specularStrength": 100
        }
    },
    {
        type: "cube",
        width: 130,
        height: 75,
        depth: 1,
        translate: [d, e + h, f + 1.6],
        rotate: j,
        op: "+",
        style: {
            "m.type": "phong",
            "m.specularStrength": 200,
            "front.m.texture.image": i
        }
    }],
    l = demo.createCombo(k);
    l.setClient("type", "tv"),
    a.add(l)
}),
demo.registerCreator("post",
function(a, b) {
    var c = b.translate || [0, 0, 0],
    d = c[0],
    e = c[1],
    f = c[2],
    g = b.width,
    h = b.height,
    i = b.pic,
    j = new mono.Cube(g, h, 0);
    j.s({
        "m.visible": !1
    }),
    j.s({
        "m.texture.image": i,
        "front.m.visible": !0
    }),
    j.setPosition(d, e, f),
    j.setClient("type", "post"),
    a.add(j)
}),
demo.registerCreator("extinguisher",
function(a, b) {
    var c = b.translate || [0, 0, 0],
    d = c[0],
    e = c[1],
    f = b.arrow,
    g = function(a, b, c, d) {
        var e = demo.createExtinguisher(a, b, c, d, f);
        a.add(e)
    },
    h = function(a, b, c, d, e) {
        return function() {
            g(a, b, c, d, e)
        }
    };
    setTimeout(h(a, c, d, e, f), demo.getRandomLazyTime())
}),
demo.registerCreator("smoke",
function(a, b) {
    var c = b.translate || [0, 0, 0],
    d = b.color,
    e = function(a, b, c) {
        var d = demo.createSmoke(b, c);
        a.add(d)
    },
    f = function(a, b, c) {
        return function() {
            e(a, b, c)
        }
    };
    setTimeout(f(a, c, d), demo.getRandomLazyTime())
}),
demo.createSmoke = function(a, b) {
    for (var c = a[0], d = a[1], e = a[2], f = new mono.Particle, g = 300, h = 0; g > h; h++) f.vertices.push(new mono.Vec3);
    return f.verticesNeedUpdate = !0,
    f.sortParticles = !1,
    f.setStyle("m.size", 20),
    f.setStyle("m.transparent", !0),
    f.setStyle("m.opacity", .5),
    f.setStyle("m.texture.image", demo.getRes("smoking.png")),
    f.setStyle("m.color", b),
    f.setStyle("m.depthTest", !1),
    f.setClient("type", "smoke"),
    f.setVisible(!1),
    f.setPosition(c, d, e),
    f
},
demo.createExtinguisher = function(a, b, c, d, e) {
    var f = new mono.Cylinder(8, 8, 50, 20);
    f.setPositionY(f.getHeight() / 2),
    f.s({
        "side.m.texture.image": demo.getRes("fire_extinguisher_side.jpg"),
        "m.type": "phong",
        "m.specularStrength": 50
    }),
    f.shadow = !0,
    f.setClient("type", "extinguisher"),
    f.setPosition(c, f.getHeight() / 2, d),
    a.add(f);
    var g = new mono.Sphere(8, 20);
    g.setParent(f),
    g.setPositionY(f.getHeight() / 2),
    g.setScaleY(.5),
    g.s({
        "m.color": "#DF0101",
        "m.ambient": "#DF0101",
        "m.type": "phong",
        "m.specularStrength": 50
    }),
    a.add(g);
    var h = new mono.Cylinder(2, 3, 10);
    h.setParent(g),
    h.setPositionY(g.getRadius()),
    h.s({
        "m.color": "orange",
        "m.ambient": "orange",
        "m.type": "phong"
    }),
    a.add(h);
    var i = new mono.Cube(14, 1, 3);
    i.setParent(h),
    i.setPositionY(h.getHeight() - 3),
    i.setPositionX(i.getWidth() / 2 - 2),
    i.setRotationZ(Math.PI / 180 * 45),
    i.s({
        "m.texture.image": demo.getRes("metal.png"),
        "m.type": "phong"
    }),
    a.add(i);
    var j = new mono.Cube(14, 1, 3);
    j.setParent(h),
    j.setPositionY(h.getHeight() - 8),
    j.setPositionX(j.getWidth() / 2),
    j.setRotationZ(Math.PI / 180 * -10),
    j.s({
        "m.texture.image": demo.getRes("metal.png"),
        "m.type": "phong"
    }),
    a.add(j);
    var k = new mono.Path;
    k.moveTo(0, 0, 0),
    k.curveTo( - 10, 0, 0, -15, -10, 0),
    k.curveTo( - 20, -20, 0, -15, -55, 0);
    var l = new mono.PathNode(k, 50, 2, 10, "round", "round");
    if (l.setParent(h), l.s({
        "m.texture.image": demo.getRes("metal.png"),
        "m.type": "phong"
    }), a.add(l), e) {
        for (var m = 6,
        n = 60,
        o = [], p = 0; m > p; p++) {
            var q = new mono.Plane(n / 2, n);
            q.s({
                "m.texture.image": demo.getRes("down.png"),
                "m.transparent": !0,
                "m.side": mono.DoubleSide,
                "m.type": "phong"
            }),
            q.setParent(h),
            q.setPositionY(n + p * n),
            q.setVisible(!1),
            q.setClient("type", "extinguisher_arrow"),
            a.add(q),
            o.push(q),
            o.index = 1e4
        }
        var r = function() {
            if (o[0].isVisible()) {
                o.index--,
                0 == o.index && (o.index = 1e4);
                for (var a = o.index % m,
                b = m - 1; b >= 0; b--) {
                    var c = o[b];
                    b === a ? c.s({
                        "m.color": "#FF8000",
                        "m.ambient": "#FF8000"
                    }) : c.s({
                        "m.color": "white",
                        "m.ambient": "white"
                    })
                }
            }
            setTimeout(r, 200)
        };
        setTimeout(r, 200)
    }
},
demo.registerFilter("camera",
function(a, b) {
    var c = b.translate[0],
    d = b.translate[1],
    e = b.translate[2],
    f = b.angle || 0,
    g = 130,
    h = function(a, b, c, d, e, f) {
        var g = demo.createCamera(a, b, c, d, e, f);
        a.add(g)
    },
    i = function(a, b, c, d, e, f) {
        return function() {
            h(a, b, c, d, e, f)
        }
    };
    setTimeout(i(a, c, d, e, f, g), demo.getRandomLazyTime())
}),
demo.createCamera = function(a, b, c, d, e, f) {
    var g = new mono.Cylinder(4, 4, 15);
    g.s({
        "m.texture.image": demo.getRes("bbb.png"),
        "top.m.texture.image": demo.getRes("camera.png"),
        "bottom.m.texture.image": demo.getRes("eee.png"),
        "m.type": "phong"
    });
    var h = {
        "side.m.normalType": mono.NormalTypeSmooth
    },
    i = new mono.Cylinder(6, 6, 20);
    i.s(h);
    var j = new mono.Cylinder(5, 5, 20);
    j.s(h);
    var k = new mono.Cube(10, 20, 10),
    l = new mono.Path;
    l.moveTo(0, 0, 0),
    l.lineTo(0, -10, 0),
    l.lineTo(0, -11, -1),
    l.lineTo(0, -12, -13),
    l.lineTo(0, -12, -30);
    var m = new mono.ComboNode([i, k, j, g], ["+", "-", "+"]);
    m.s({
        "m.type": "phong",
        "m.color": "#2E2E2E",
        "m.ambient": "#2E2E2E",
        "m.specularStrength": 50
    }),
    m.setRotation(Math.PI / 180 * 100, 0, Math.PI / 180 * e),
    m.setPosition(b, c, d),
    m.setClient("type", "camera"),
    m.setClient("dbl.func",
    function() {
        demo.showVideoDialog("Camera #: C300-493A  |  Status: OK")
    }),
    a.add(m);
    var n = new mono.PathNode(l, 10, 2, 10, "plain", "plain");
    n.s({
        "m.color": "#2E2E2E",
        "m.ambient": "#2E2E2E",
        "m.type": "phong",
        "m.specularStrength": 50,
        "m.normalType": mono.NormalTypeSmooth
    }),
    n.setRotationX( - Math.PI / 2),
    n.setParent(m),
    a.add(n)
},
demo.createWall = function(a, b, c, d, e, f) {
    var g = new mono.PathCube(a, b, c);
    return g.s({
        "outside.m.color": e,
        "inside.m.type": "basic",
        "inside.m.color": d,
        "aside.m.color": e,
        "zside.m.color": e,
        "top.m.color": f,
        "bottom.m.color": f,
        "inside.m.lightmap.image": demo.getRes("inside_lightmap.jpg"),
        "outside.m.lightmap.image": demo.getRes("outside_lightmap.jpg"),
        "aside.m.lightmap.image": demo.getRes("outside_lightmap.jpg"),
        "zside.m.lightmap.image": demo.getRes("outside_lightmap.jpg")
    }),
    g
},
demo.createPlant = function(a, b, c, d, e, f) {
    var g;
    if (demo._plantInstance) g = demo._plantInstance.clone();
    else {
        var h = 30,
        i = 120,
        j = demo.getRes("plant.png"),
        k = [],
        l = new mono.Cylinder(.6 * h, .4 * h, i / 5, 20, 1, !1, !1);
        l.s({
            "m.type": "phong",
            "m.color": "#845527",
            "m.ambient": "#845527",
            "m.texture.repeat": new mono.Vec2(10, 4),
            "m.specularmap.image": demo.getRes("metal_normalmap.jpg"),
            "m.normalmap.image": demo.getRes("metal_normalmap.jpg")
        });
        var m = l.clone();
        m.setScale(.9, 1, .9);
        var n = m.clone();
        n.setScale(.9, .7, .9),
        n.s({
            "m.type": "phong",
            "m.color": "#163511",
            "m.ambient": "#163511",
            "m.texture.repeat": new mono.Vec2(10, 4),
            "m.specularmap.image": demo.getRes("metal_normalmap.jpg"),
            "m.normalmap.image": demo.getRes("metal_normalmap.jpg")
        });
        var o = new mono.ComboNode([l, m, n], ["-", "+"]);
        k.push(o);
        for (var p = 5,
        q = 0; p > q; q++) {
            var g = new mono.Cube(2 * h, i, .01);
            g.s({
                "m.visible": !1,
                "m.alphaTest": .5,
                "front.m.visible": !0,
                "front.m.texture.image": j,
                "back.m.visible": !0,
                "back.m.texture.image": j
            }),
            g.setParent(o),
            g.setPositionY(l.getHeight() / 2 + g.getHeight() / 2 - 3),
            g.setRotationY(Math.PI * q / p),
            k.push(g)
        }
        demo._plantInstance = new mono.ComboNode(k),
        demo._plantInstance.setClient("plant.original.y", l.getHeight() / 2),
        g = demo._plantInstance
    }
    return g.setPosition(a, g.getClient("plant.original.y") + b, c),
    g.setScale(d, e, f),
    g.setClient("type", "plant"),
    g
},
demo.createAirPlanes = function() {
    var a = [],
    b = new mono.Path;
    b.moveTo(0, 0, 0),
    b.curveTo(0, 80, 30, 0, 100, 150),
    b.curveTo(0, 120, 200, 0, 200, 230);
    var c = function(a, c, d) {
        var e = new mono.Path;
        e.moveTo(0, 0, 0),
        e.lineTo(a, 0, 0);
        var f = new mono.CurvePlane(e, b);
        f.setPosition(c, 0, d),
        f.s({
            "m.texture.image": demo.getRes("arrow.png"),
            "m.side": "both",
            "m.texture.repeat": new mono.Vec2(parseInt(a / 50), 8),
            "m.transparent": !0,
            "m.gradient": {
                0 : "#84DF29",
                .6 : "#DF6029",
                1 : "#DF2929"
            },
            "m.gradientType": 2
        });
        var g = new twaver.Animate({
            from: 0,
            to: 1,
            dur: 1e3,
            reverse: !1,
            repeat: Number.POSITIVE_INFINITY,
            onUpdate: function(a) {
                f.s({
                    "m.texture.offset": new mono.Vec2(0, -a)
                })
            }
        });
        return f.airAnimation = g,
        f
    };
    return a.push(c(450, -10, 150)),
    a.push(c(195, -310, 150)),
    a.push(c(250, -400, -350)),
    a
},
demo.registerFilter("water_cable",
function(a, b) {
    var c = demo.create3DPath(b.data);
    c = mono.PathNode.prototype.adjustPath(c, 5);
    var d = b.color,
    e = b.size,
    f = b.y,
    g = function(a, b, c, d, e) {
        a.add(demo.createWaterCable(b, c, d, e))
    },
    h = function(a, b, c, d, e) {
        return function() {
            g(a, b, c, d, e)
        }
    };
    setTimeout(h(a, c, d, e, f), demo.getRandomLazyTime())
}),
demo.createWaterCable = function(a, b, c, d) {
    var e = new mono.PathNode(a, 100, c);
    return e.s({
        "m.type": "phong",
        "m.specularStrength": 50,
        "m.color": b,
        "m.ambient": b,
        "m.texture.image": demo.getRes("flow.jpg"),
        "m.texture.repeat": new mono.Vec2(100, 1)
    }),
    e.setStartCap("plain"),
    e.setEndCap("plain"),
    e.setPositionY(d),
    e.setClient("type", "water_cable"),
    e.setVisible(!1),
    e
},
demo.registerFilter("laser",
function(a, b) {
    var c = function(a, b) {
        a.add(demo.createLaser(a, b))
    },
    d = function(a, b) {
        return function() {
            c(a, b)
        }
    };
    setTimeout(d(a, b), demo.getRandomLazyTime())
}),
demo.createLaser = function(a, b) {
    var c = Math.atan2(b.to[1] - b.from[1], b.to[0] - b.from[0]),
    d = 1.5,
    e = d * Math.sin(c),
    f = d * Math.cos(c),
    g = d * Math.sin(c + Math.PI),
    h = d * Math.cos(c + Math.PI),
    i = new mono.Cylinder(5, 5, 170);
    i.s({
        "m.texture.image": demo.getRes("rack_inside.jpg"),
        "m.texture.repeat": new mono.Vec2(1, 3),
        "m.color": "#A4A4A4",
        "m.ambient": "#A4A4A4",
        "m.type": "phong",
        "m.specularStrength": 10
    }),
    i.setPosition(b.from[0], i.getHeight() / 2, b.from[1]),
    i.setClient("type", "laser"),
    i.setVisible(!1),
    a.add(i);
    var j = new mono.Cylinder(4, 4, 130);
    j.s({
        "m.type": "phong",
        "m.color": "#A9F5D0",
        "m.ambient": "#A9F5D0",
        "m.envmap.image": demo.getEnvMap()
    }),
    j.setParent(i),
    j.setPosition(f, 0, e),
    j.setClient("type", "laser"),
    j.setVisible(!1),
    a.add(j);
    var k = i.clone();
    k.setPosition(b.to[0], k.getHeight() / 2, b.to[1]),
    k.setClient("type", "laser"),
    k.setVisible(!1),
    a.add(k);
    var l = j.clone();
    l.setParent(k),
    l.setPosition(h, 0, g),
    l.setClient("type", "laser"),
    l.setVisible(!1),
    a.add(l);
    for (var m = "red",
    n = 0; 5 > n; n++) {
        var o = new mono.Cube(1, 1, 1);
        o.s({
            "m.color": m,
            "m.ambient": m
        }),
        o.setPosition(b.from[0], 30 + 27 * n, b.from[1]),
        o.setClient("type", "laser"),
        o.setVisible(!1),
        a.add(o);
        var p = o.clone();
        p.setPosition(b.to[0], 30 + 27 * n, b.to[1]),
        p.setClient("type", "laser"),
        p.setVisible(!1),
        a.add(p);
        var q = new mono.Link(o, p);
        q.s({
            "m.color": m,
            "m.ambient": m,
            "m.type": "phong",
            "m.transparent": !0,
            "m.opacity": .7
        }),
        q.setClient("type", "laser"),
        q.setVisible(!1),
        a.add(q)
    }
};
var dataJson = {
    objects: [{
        type: "floor",
        width: 800,
        depth: 1200
    },
    {
        type: "floor_cut",
        width: 200,
        height: 20,
        depth: 260,
        translate: [ 110, 0, 530],
        rotate: [Math.PI / 180 * 3, 0, 0]
    }
    // ,
    // {
    //     type: "floor_box",
    //     width: 300,
    //     height: 50,
    //     depth: 100,
    //     translate: [-200, 0, 500]
    // }
    ,
    {
        type: "wall",
        height: 200,
        translate: [ -200, 0, -300],
        data: [[0, 0], [400, 0], [400, 600], [0, 600], [0, 0]],
        children: [
    
        {
            type: "door",
            width: 105,
            height: 180,
            depth: 26,
            translate: [ 100, 0, 300]
        },
        {
            type: "post",
            translate: [130, 120, -290],
            width: 70,
            height: 120,
            pic: demo.getRes("post.jpg")
        },
        {
            type: "tv",
            translate: [-100, 100, 310]
        }]
    },

    {
        type: "plants",
        shadow: !1,
        scale: [.5, .5, .5],
        translates: [[180, -5, 330]]
    },
    {
        type: "glass_wall",
        width: 1180,
        rotate: [0, Math.PI / 180 * 90, 0],
        translate: [ -390, 0, 0]
    },
    {
        type: "glass_wall",
        width: 1180,
        rotate: [0, Math.PI / 180 * 90, 0],
        translate: [390, 0, 0]
    },
    {
        type: "glass_wall",
        width: 800,
        translate: [ 0 , 0, -590]
    },
    //档案柜
    {
        type: "racks",
        translates: [[ -95, 0, -48],[ -95, 0, -132],[ -95, 0, -216]],
        labels: function() {
            for (var a = [], b = 1; 4 > b; b++) {
                // var c = "1A";
                //var c="";
                //10 > b && (c += "0"),
                //a.push(c + b)
                a.push(b);
            }
            return a
        } (),
        // mono.AlarmSeverity.WARNING, mono.AlarmSeverity.CRITICAL, null, mono.AlarmSeverity.MINOR
        severities: [null, null, null]
    },
    // {
    //     type: "rail",
    //     data: [[ - 180, 250], [ - 400, 250], [ - 400, -250], [400, -250]]
    // },
    // {
    //     type: "connection",
    //     color: "#ED5A00",
    //     y: 265,
    //     flow: .05,
    //     data: [[ - 180, -100, -250], [ - 180, -100, -150], [ - 180, -50, -150], [ - 180, -50, -250], [ - 180, 0, -250], [ - 400, 0, -250], [ - 400, 0, 250], [400, 0, 250], [400, -50, 250], [400, -50, 350], [400, -100, 350], [400, -100, 250]]
    // },
    // {
    //     type: "connection",
    //     color: "#21CD43",
    //     y: 265,
    //     flow: -.05,
    //     data: [[ - 177, -100, -250], [ - 177, -100, -150], [ - 177, -50, -150], [ - 177, -50, -247], [ - 177, 0, -247], [ - 397, 0, -247], [ - 397, 0, 247], [403, 0, 247], [403, -50, 247], [403, -50, 350], [403, -100, 350], [403, -100, 250]]
    // },
    {
        type: "camera",
        translate: [80, 200, -270]
    },
    {
        type: "camera",
        translate: [170, 200, 200],
        angle: 90
    },
    {
        type: "camera",
        translate: [ 100, 200, 330],
        alarm: mono.AlarmSeverity.WARNING
    },
    //灭火器
    {
        type: "extinguisher",
        translate: [ -180, 200]
    },
    {
        type: "extinguisher",
        translate: [ -180, 220],
        arrow: !0
    },
    {
        type: "extinguisher",
        translate: [ -180, 240]
    },
    // {
    //     type: "smoke",
    //     translate: [300, 180, 240],
    //     color: "#FAAC58"
    // },
    // {
    //     type: "smoke",
    //     translate: [ - 300, 180, -240],
    //     color: "#B40431"
    // },
    // {
    //     type: "water_cable",
    //     color: "#B45F04",
    //     y: 10,
    //     size: 3,
    //     data: [[50, 0, 50], [460, 0, 50], [460, 0, 450], [ - 460, 0, 450], [ - 460, 0, -450], [ - 100, 0, -450], [ - 50, 0, -400], [ - 50, 0, 0], [0, 0, 50], [50, 0, 50]]
    // },
    // {
    //     type: "water_cable",
    //     color: "#04B431",
    //     y: 10,
    //     size: 3,
    //     data: [[ - 300, 0, 180], [440, 0, 180], [440, 0, 330], [ - 340, 0, 330], [ - 340, 0, -180], [ - 420, 0, -180], [ - 420, 0, -310], [ - 120, 0, -310], [ - 120, 0, -180], [ - 320, 0, -180]]
    // },
    // {
    //     type: "laser",
    //     from: [ - 485, 330],
    //     to: [485, 330]
    // },
    // {
    //     type: "laser",
    //     from: [ - 485, 0],
    //     to: [ - 20, 0]
    // },
    // {
    //     type: "laser",
    //     from: [ - 80, 480],
    //     to: [ - 80, -480]
    // }
    ]
};

Tooltip = function(a, b) {
    this.mainContent = document.createElement("div"),
    this.keys = a,
    this.values = b,
    this.init()
},
twaver.Util.ext("Tooltip", Object, {
    init: function() {
        this.mainContent.setAttribute("class", "tooltip"),
        this.mainContent.setAttribute("id", "tooltip"),
        this.table = document.createElement("table");
        for (var a = 0; a < this.keys.length; a++) {
            var b = document.createElement("tr"),
            c = document.createElement("td");
            c.setAttribute("class", "tooltip-key"),
            c.innerHTML = this.keys[a],
            b.appendChild(c);
            var d = document.createElement("td");
            d.setAttribute("class", "tooltip-value"),
            d.innerHTML = this.values[a],
            b.appendChild(d),
            this.table.appendChild(b)
        }
        this.mainContent.appendChild(this.table)
    },
    getView: function() {
        return this.mainContent
    },
    setValues: function(a) {
        this.values = a;
        for (var b = this.table.childNodes,
        c = 0; c < this.values.length; c++) {
            var d = this.values[c],
            e = b[c];
            e.lastChild.innerHTML = d
        }
    }
});