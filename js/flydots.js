var flyDots = new janvas.Canvas({
  container: "#app",
  interval: 16,
  props: {
    dots: [],
    lines: []
  },
  components: {
    factory: (function () {
      function Dot($ctx, width, height) {
        this.setBounding(width, height);
        this._x = janvas.Utils.randInt(this._left, this._right, true);
        this._y = janvas.Utils.randInt(this._top, this._bottom, true);
        this._r = 3;
        this._lvx = this._vx = janvas.Utils.randSign() * janvas.Utils.randInt(10, 100, true) / 100;
        this._lvy = this._vy = janvas.Utils.randSign() * janvas.Utils.randInt(10, 100, true) / 100;
        this._relateStart = [];
        this._relateEnd = [];
        this.arc = new janvas.Arc($ctx, this._x, this._y, this._r);
        this.arc.getStyle().setFillStyle("hsl(0, 0%, 40%)");
      }

      Dot.prototype = {
        initXY: function (x, y) {
          this._x = x;
          this._y = y;
          this.arc.initXY(x, y);
          this._relateStart.forEach(this.startCallback, this);
          this._relateEnd.forEach(this.endCallBack, this);
        },
        closer: function (x, y) {
          this._vx = (x - this._x) / Math.abs(x - this._x);
          this._vy = (y - this._y) / Math.abs(y - this._y);
        },
        restore: function () {
          this._vx = this._lvx;
          this._vy = this._lvy;
        },
        relateStart: function (line) {
          this._relateStart.push(line);
        },
        relateEnd: function (line) {
          this._relateEnd.push(line);
        },
        startCallback: function (line) {
          line.initXY(this._x, this._y);
        },
        endCallBack: function (line) {
          line.setEndX(this._x).setEndY(this._y);
        },
        setBounding: function (width, height) {
          this._left = this._top = -50;
          this._right = width + 50;
          this._bottom = height + 50;
        },
        update: function () {
          this._x += this._vx;
          this._y += this._vy;
          this.initXY(this._x, this._y);
          if (this._x < this._left || this._x > this._right) this._lvx = this._vx *= -1;
          if (this._y < this._top || this._y > this._bottom) this._lvy = this._vy *= -1;
        },
        draw: function () {
          this.arc.fill();
        }
      };

      function Line($ctx, source, target) {
        this.line = new janvas.Line($ctx);
        source.relateStart(this.line);
        target.relateEnd(this.line);
        this._rgb = new janvas.Rgb(0, 0, 0, 0);
      }

      Line.prototype = {
        update: function () {
          var _ratio = 255 - janvas.Utils.pythagorean(
            this.line.getStartX() - this.line.getEndX(),
            this.line.getStartY() - this.line.getEndY()) / 100 * 255;
          this._ratio = _ratio < 0 ? 0 : _ratio;
          this.line.getStyle().setStrokeStyle(this._rgb.setAlpha(this._ratio).toRgbString(true));
        },
        draw: function () {
          if (this._ratio) this.line.stroke();
        }
      };

      return {
        Dot: Dot,
        Line: Line
      };
    }())
  },
  methods: {
    init: function () {
      this.background = new janvas.Rect(this.$ctx, 0, 0);
      for (var i = 0; i < 100; i++) {
        var dot = new this.factory.Dot(this.$ctx, this.$width, this.$height);
        this.dots.forEach(function (target) {
          this.lines.push(new this.factory.Line(this.$ctx, dot, target));
        }, this);
        this.dots.push(dot);
      }
      this.cursor = new this.factory.Dot();
      this.dots.forEach(function (target) {
        this.lines.push(new this.factory.Line(this.$ctx, this.cursor, target));
      }, this);
    },
    update: function () {
      this.dots.forEach(function (dot) {
        dot.update();
      }, this);
      this.lines.forEach(function (line) {
        line.update();
      });
    },
    draw: function () {
      this.background.clear(0, 0, this.$width, this.$height);
      this.lines.forEach(function (line) {
        line.draw();
      });
      this.dots.forEach(function (dot) {
        dot.draw();
      });
    }
  },
  events: {
    mousedown: function (ev) {
      this.dots.forEach(function (dot) {
        dot.closer(ev.$x, ev.$y);
      }, this);
    },
    mousemove: function (ev) {
      this.cursor.initXY(ev.$x, ev.$y);
    },
    mouseup: function () {
      this.dots.forEach(function (dot) {
        dot.restore();
      });
    },
    resize: function () {
      this.background.setWidth(this.$width).setHeight(this.$height);
      this.dots.forEach(function (dot) {
        dot.setBounding(this.$width, this.$height);
      }, this);
    },
    visibilitychange: function (visible) {
      visible ? this.$raf.resume() : this.$raf.pause();
    }
  }
});
