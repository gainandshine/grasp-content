// Exact HTML Generators matching mobile React Native WebViews 1:1

function generate2dAnimHtml(spec) {
  const setupCode = spec.setup_code || spec.code || '';
  const safeSetup = compileUserCode(setupCode, ['api', 'anime', 'd3']);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <script>
    window.onerror = function(message, source, lineno, colno, error) {
      var msg = message + ' (' + lineno + ':' + colno + ')';
      var errDiv = document.getElementById('error');
      if (errDiv) { errDiv.textContent = msg; errDiv.style.display = 'block'; }
    };
    console.error = function() {
      var msg = Array.from(arguments).map(String).join(' ');
      var errDiv = document.getElementById('error');
      if (errDiv) { errDiv.textContent = msg; errDiv.style.display = 'block'; }
    };
  </script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
  <style>
    body { margin: 0; overflow: hidden; background: #F5F0E8; }
    canvas { display: block; }
    #error { position: absolute; top: 20px; left: 20px; right: 20px; background: #FEE; padding: 15px; border-radius: 12px; color: #C33; font-size: 14px; white-space: pre-wrap; max-height: 200px; overflow: auto; display: none; border: 1px solid #FCC; z-index: 9999; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <div id="error"></div>
  <script>
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var errorDiv = document.getElementById('error');
    function showError(msg) { errorDiv.textContent = msg; errorDiv.style.display = 'block'; }
    try {
      var dpr = window.devicePixelRatio || 1;
      var W = window.innerWidth;
      var H = window.innerHeight;
      
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.scale(dpr, dpr);

      var __origFillText = ctx.fillText.bind(ctx);
      ctx.fillText = function(text, x, y, maxWidthArg) {
        var half = W / 2;
        var limit = (x < half ? half - x : W - x) - 8;
        if (maxWidthArg != null) limit = Math.min(limit, maxWidthArg);
        if (limit < 10) limit = 10;
        if (ctx.measureText(text).width > limit) {
          var fontStr = ctx.font;
          var m = /(\d+(?:\.\d+)?)px/.exec(fontStr);
          if (m) {
            var size = parseFloat(m[1]);
            while (size > 7 && ctx.measureText(text).width > limit) {
              size -= 1;
              ctx.font = fontStr.replace(/\d+(?:\.\d+)?px/, size + 'px');
            }
            __origFillText(text, x, y);
            ctx.font = fontStr;
            return;
          }
        }
        __origFillText(text, x, y, maxWidthArg);
      };

      var Vector = function(x, y) {
        this.x = x || 0;
        this.y = y || 0;
        this.add = function(v) { return new Vector(this.x + v.x, this.y + v.y); };
        this.sub = function(v) { return new Vector(this.x - v.x, this.y - v.y); };
        this.mult = function(n) { return new Vector(this.x * n, this.y * n); };
        this.div = function(n) { return new Vector(this.x / n, this.y / n); };
        this.mag = function() { return Math.sqrt(this.x * this.x + this.y * this.y); };
        this.normalize = function() { var m = this.mag(); return m === 0 ? new Vector(0, 0) : this.div(m); };
        this.dot = function(v) { return this.x * v.x + this.y * v.y; };
      };

      var drawArrow = function(x1, y1, x2, y2, color, strokeWidth) {
        ctx.save();
        ctx.strokeStyle = color || '#000000';
        ctx.fillStyle = color || '#000000';
        ctx.lineWidth = strokeWidth || 2;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        var angle = Math.atan2(y2 - y1, x2 - x1);
        var headLen = 10;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath(); ctx.fill(); ctx.restore();
      };

      var drawLine = function(x1, y1, x2, y2, color, strokeWidth, dashed) {
        ctx.save();
        ctx.strokeStyle = color || '#000000';
        ctx.lineWidth = strokeWidth || 1;
        if (dashed) ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
      };

      var drawCircle = function(x, y, r, color, isFilled) {
        ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        if (isFilled) { ctx.fillStyle = color || '#000000'; ctx.fill(); }
        else { ctx.strokeStyle = color || '#000000'; ctx.stroke(); }
        ctx.restore();
      };

      var drawGrid = function(step, color) {
        ctx.save(); ctx.strokeStyle = color || '#E5E7EB'; ctx.lineWidth = 0.5;
        var s = step || 20;
        for (var x = 0; x < W; x += s) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (var y = 0; y < H; y += s) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
        ctx.restore();
      };

      var t = 0;
      window.__paused = false;
      var setupFunc = new Function('api', 'anime', 'd3', 'ctx', 't', 'W', 'H', 'dt', ${JSON.stringify(safeSetup)});
      var safeAnime = typeof anime !== 'undefined' ? anime : null;
      var safeD3 = typeof d3 !== 'undefined' ? d3 : null;
      var apiObj = { 
        ctx: ctx, width: W, height: H, anime: safeAnime, d3: safeD3,
        Vector: Vector, drawArrow: drawArrow, drawLine: drawLine, drawCircle: drawCircle, drawGrid: drawGrid
      };
      
      var animInstance = null;
      var setupDone = false;

      function trySetup() {
        if (W > 0 && H > 0) {
          try {
            apiObj.width = W; apiObj.height = H;
            animInstance = setupFunc(apiObj, safeAnime, safeD3, ctx, 0, W, H, 0);
            setupDone = true;
          } catch (err) { showError('Setup Error: ' + err.toString()); setupDone = true; }
        }
      }

      trySetup();

      var lastTime = performance.now();
      function animate(now) {
        var dt = (now - lastTime) / 1000;
        lastTime = now;
        if (window.__paused) { requestAnimationFrame(animate); return; }

        var currentW = window.innerWidth;
        var currentH = window.innerHeight;
        if (currentW > 0 && currentH > 0 && (currentW !== W || currentH !== H)) {
          W = currentW; H = currentH;
          canvas.width = W * dpr; canvas.height = H * dpr;
          canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
          ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.scale(dpr, dpr);
          apiObj.width = W; apiObj.height = H;
          if (!setupDone) trySetup();
        }

        if (!setupDone) { requestAnimationFrame(animate); return; }

        try {
          if (animInstance && typeof animInstance.draw === 'function') {
            ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);
            animInstance.draw(ctx, W, H, t, dt);
          } else {
            ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);
            setupFunc(apiObj, safeAnime, safeD3, ctx, t, W, H, dt);
          }
        } catch (err) { showError('Animation Draw Error: ' + err.toString()); return; }

        t += 1;
        requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);

      window.addEventListener('resize', function() {
        W = window.innerWidth; H = window.innerHeight;
        canvas.width = W * dpr; canvas.height = H * dpr;
        canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.scale(dpr, dpr);
        apiObj.width = W; apiObj.height = H;
      });
    } catch (err) { showError('Setup Error: ' + err.toString()); }
  </script>
</body>
</html>`;
}

function generateSimulationHtml(spec) {
  const controlsData = JSON.stringify(spec.controls || []);
  const wrappedCodeData = JSON.stringify(spec.setup_code || '');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <style>
    :root { --bg: #F9FAFB; --panel-bg: #FFFFFF; --text: #111827; --text-muted: #6B7280; --border: #E5E7EB; --primary: #EC4899; }
    body { margin: 0; padding: 0; overflow: hidden; background: var(--bg); font-family: system-ui, sans-serif; width: 100vw; height: 100vh; display: flex; flex-direction: column; }
    #header-bar { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--panel-bg); border-bottom: 1px solid var(--border); }
    .header-btn { padding: 6px 12px; border-radius: 8px; background: var(--bg); border: 1px solid var(--border); cursor: pointer; font-size: 11px; font-weight: 600; }
    #main-layout { flex: 1; display: flex; flex-direction: column; position: relative; }
    #canvas-container { flex: 1; position: relative; background: #FFFFFF; overflow: hidden; }
    canvas { display: block; width: 100%; height: 100%; }
    #widget-panel { background: var(--panel-bg); border-top: 1px solid var(--border); padding: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; max-height: 150px; overflow-y: auto; }
    .widget-container { display: flex; flex-direction: column; gap: 4px; }
    .widget-label { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
    .widget-input-row { display: flex; align-items: center; gap: 8px; }
    .widget-val { font-size: 11px; font-weight: 600; min-width: 28px; text-align: right; }
    input[type="range"] { flex: 1; }
    #error-banner { position: absolute; top: 10px; left: 10px; right: 10px; background: #FEE2E2; border: 1px solid #FECACA; border-radius: 8px; padding: 10px; color: #991B1B; font-size: 11px; display: none; z-index: 1000; }
  </style>
</head>
<body>
  <div id="header-bar">
    <button class="header-btn" onclick="togglePlay()"><span id="play-lbl">Pause</span></button>
    <button class="header-btn" onclick="resetSimulation()">Reset</button>
  </div>
  <div id="main-layout">
    <div id="error-banner"></div>
    <div id="canvas-container"><canvas id="sim-canvas"></canvas></div>
    <div id="widget-panel"></div>
  </div>
  <script>
    var canvas = document.getElementById("sim-canvas");
    var ctx2d = null;
    function getCtx2d() { if (!ctx2d) { ctx2d = canvas.getContext("2d"); } return ctx2d; }
    var errorBanner = document.getElementById("error-banner");
    var controlsList = ${controlsData};
    var controlsState = {};
    var simulationState = {};
    var isPaused = false;
    var time = 0; var lastFrameTime = performance.now();

    function showError(msg) { errorBanner.textContent = msg; errorBanner.style.display = 'block'; }

    var panel = document.getElementById("widget-panel");
    controlsList.forEach(function(ctrl) {
      controlsState[ctrl.id] = ctrl.default;
      var wrap = document.createElement("div"); wrap.className = "widget-container";
      var lbl = document.createElement("label"); lbl.className = "widget-label"; lbl.textContent = ctrl.label; wrap.appendChild(lbl);
      var row = document.createElement("div"); row.className = "widget-input-row";

      if (ctrl.type === 'slider') {
        var input = document.createElement("input"); input.type = "range";
        input.min = ctrl.min !== undefined ? ctrl.min : 0; input.max = ctrl.max !== undefined ? ctrl.max : 100; input.step = ctrl.step !== undefined ? ctrl.step : 1; input.value = ctrl.default;
        var val = document.createElement("span"); val.className = "widget-val"; val.textContent = ctrl.default;
        input.oninput = function() { var num = parseFloat(this.value); controlsState[ctrl.id] = num; val.textContent = num; triggerOnControlChange(ctrl.id, num); };
        row.appendChild(input); row.appendChild(val);
      }
      wrap.appendChild(row); panel.appendChild(wrap);
    });

    var Vector = function(x, y) { this.x = x || 0; this.y = y || 0; };
    var simInstance = null;
    var api = { canvas: canvas, get ctx() { return getCtx2d(); }, width: 0, height: 0, Vector: Vector };

    function compileSimulation() {
      var dpr = window.devicePixelRatio || 1;
      api.width = canvas.width / dpr; api.height = canvas.height / dpr;
      var wrappedCode = ${wrappedCodeData};
      try {
        var setupFunc = new Function('api', 'controls', 'state', 'window', wrappedCode);
        simInstance = setupFunc(api, controlsState, simulationState, window) || {};
        if (simInstance.init) simInstance.init(api);
      } catch (err) { showError("Simulation Setup Error: " + err.toString()); }
    }

    function triggerOnControlChange(id, val) {
      if (simInstance && typeof simInstance.onControlChange === 'function') {
        try { simInstance.onControlChange(id, val, controlsState); } catch (err) { showError("Control Error: " + err.toString()); }
      }
    }

    function loop(now) {
      requestAnimationFrame(loop);
      var dt = (now - lastFrameTime) / 1000; lastFrameTime = now;
      if (isPaused) return;
      time += dt;
      try {
        if (simInstance) {
          if (simInstance.update) simInstance.update(dt, time, controlsState);
          if (simInstance.draw) simInstance.draw(api);
        }
      } catch (err) { showError("Runtime Error: " + err.toString()); isPaused = true; }
    }

    function togglePlay() { isPaused = !isPaused; document.getElementById("play-lbl").textContent = isPaused ? "Play" : "Pause"; }
    function resetSimulation() { time = 0; simulationState = {}; compileSimulation(); }

    compileSimulation();
    requestAnimationFrame(loop);
  </script>
</body>
</html>`;
}

function compileUserCode(code, allowedParams) {
  if (!code) return 'return null;';
  let cleaned = code.trim();
  // Strip import/export statements if present
  cleaned = cleaned.replace(/^\s*import\s+.*?;?\s*$/gm, '');
  cleaned = cleaned.replace(/^\s*export\s+default\s+/gm, '');
  cleaned = cleaned.replace(/^\s*export\s+/gm, '');
  
  if (!cleaned.includes('return') && !cleaned.includes('function')) {
    return `return (function(${allowedParams.join(', ')}) {\n${cleaned}\n})(${allowedParams.join(', ')});`;
  }
  return cleaned;
}
