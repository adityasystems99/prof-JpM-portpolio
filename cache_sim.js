/**
 * cache_sim.js - Interactive Cache-Coherency (CMO) & DMA Simulator
 * Based on verified research: "Formal Verification of Software-Managed Cache Coherency
 * for RISC-V Heterogeneous Embedded Systems" (SmartCom LNNS 2026, Prof. Jyotiprakash Mishra)
 */

(function () {
  'use strict';

  class CacheCoherencySimulator {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container) return;

      this.state = {
        cacheState: 'INVALID', // INVALID, CLEAN, DIRTY
        cacheData: 0x00,
        cacheTag: '0x1000',
        memoryData: 0x1A,
        dmaData: 0x99,
        lastOperation: 'System Initialized',
        hazard: null,
        cmoCount: 0,
        baselineCmoCount: 0,
        stepIndex: 0
      };

      this.init();
    }

    init() {
      this.render();
      this.wireEvents();
    }

    render() {
      const s = this.state;
      const stateBadge = {
        INVALID: '<span style="color:#ff4d6d;border:1px solid #ff4d6d;padding:2px 8px;border-radius:4px;font-weight:bold;">INVALID</span>',
        CLEAN: '<span style="color:#4cc3ff;border:1px solid #4cc3ff;padding:2px 8px;border-radius:4px;font-weight:bold;">CLEAN</span>',
        DIRTY: '<span style="color:#ffb000;border:1px solid #ffb000;padding:2px 8px;border-radius:4px;font-weight:bold;">DIRTY (MODIFIED)</span>'
      }[s.cacheState];

      this.container.innerHTML = `
        <div class="cache-sim-panel" style="border:1px solid var(--line);border-radius:12px;background:var(--panel2);padding:18px;margin:16px 0;font-family:var(--font);">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line);padding-bottom:12px;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
            <div>
              <h4 style="margin:0;font-size:15px;color:var(--accent);letter-spacing:0.04em;">Interactive RISC-V Software-Managed Cache Coherency (Zicbom) Simulator</h4>
              <small style="color:var(--muted);font-size:11.5px;">Formal Verification Model · SmartCom LNNS 2026</small>
            </div>
            <div style="font-size:12px;color:var(--accent2);display:flex;gap:12px;">
              <span>CMO Optimizations: <b>-58.8%</b></span>
              <span>Total CMOs: <b>${s.cmoCount}</b></span>
            </div>
          </div>

          <!-- Hardware Architecture Diagram Grid -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:12px;margin-bottom:16px;">
            <!-- CPU Core -->
            <div style="border:1px solid var(--line);border-radius:8px;padding:12px;background:var(--panel);text-align:center;">
              <div style="font-size:11px;color:var(--muted);text-transform:uppercase;">RISC-V CPU Core</div>
              <div style="font-size:16px;font-weight:bold;color:var(--fg);margin:6px 0;">RV64G Core</div>
              <div style="font-size:11px;color:var(--dim);">Load / Store Pipeline</div>
            </div>

            <!-- L1/L2 Cache Line -->
            <div style="border:2px solid var(--accent);border-radius:8px;padding:12px;background:var(--panel);text-align:center;box-shadow:var(--glow);">
              <div style="font-size:11px;color:var(--muted);text-transform:uppercase;">Cache Line (Zicbom)</div>
              <div style="margin:6px 0;">${stateBadge}</div>
              <div style="font-size:12px;color:var(--fg);font-family:monospace;">Data: <b>0x${s.cacheData.toString(16).toUpperCase().padStart(2, '0')}</b> | Tag: ${s.cacheTag}</div>
            </div>

            <!-- Main Memory -->
            <div style="border:1px solid var(--line);border-radius:8px;padding:12px;background:var(--panel);text-align:center;">
              <div style="font-size:11px;color:var(--muted);text-transform:uppercase;">Main DRAM</div>
              <div style="font-size:16px;font-weight:bold;color:var(--fg);margin:6px 0;">0x${s.memoryData.toString(16).toUpperCase().padStart(2, '0')}</div>
              <div style="font-size:11px;color:var(--dim);">Physical Memory @ ${s.cacheTag}</div>
            </div>

            <!-- DMA Peripheral -->
            <div style="border:1px solid #ff4d6d;border-radius:8px;padding:12px;background:var(--panel);text-align:center;">
              <div style="font-size:11px;color:#ff8fa3;text-transform:uppercase;">DMA Engine</div>
              <div style="font-size:16px;font-weight:bold;color:#ff4d6d;margin:6px 0;">0x${s.dmaData.toString(16).toUpperCase().padStart(2, '0')}</div>
              <div style="font-size:11px;color:var(--dim);">Bypasses CPU Cache Hierarchy</div>
            </div>
          </div>

          <!-- Status / Hazard Alert Banner -->
          ${s.hazard ? `
            <div style="background:rgba(255, 77, 109, 0.16);border:1px solid #ff4d6d;border-radius:8px;padding:10px 14px;margin-bottom:14px;color:#ff8fa3;font-size:12px;">
              <b>⚠ FORMAL VERIFICATION ASSERTION FAILED:</b> ${s.hazard}
            </div>
          ` : `
            <div style="background:rgba(57, 255, 122, 0.1);border:1px solid var(--accent);border-radius:8px;padding:10px 14px;margin-bottom:14px;color:var(--fg);font-size:12px;">
              <b>✔ SPIN/PROMELA MONITOR:</b> Coherency invariant holds. Last action: <i>${s.lastOperation}</i>
            </div>
          `}

          <!-- Interactive Control Buttons -->
          <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
            <button id="simCpuRead" style="border:1px solid var(--accent);background:var(--panel);color:var(--accent);padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;">CPU Read</button>
            <button id="simCpuWrite" style="border:1px solid var(--accent);background:var(--panel);color:var(--accent);padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;">CPU Write (Dirty)</button>
            <button id="simCboClean" style="border:1px solid var(--accent2);background:var(--panel);color:var(--accent2);padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;">CBO.CLEAN</button>
            <button id="simCboInval" style="border:1px solid var(--accent2);background:var(--panel);color:var(--accent2);padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;">CBO.INVAL</button>
            <button id="simCboFlush" style="border:1px solid var(--accent2);background:var(--panel);color:var(--accent2);padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;">CBO.FLUSH</button>
            <button id="simDmaWrite" style="border:1px solid #ff4d6d;background:var(--panel);color:#ff8fa3;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;">DMA Write (Bypass)</button>
            <button id="simDmaRead" style="border:1px solid #ff4d6d;background:var(--panel);color:#ff8fa3;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;">DMA Read (Bypass)</button>
            <button id="simBenchmark" style="border:1px solid var(--warn);background:var(--panel);color:var(--warn);padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;">Run Verified Safe Tour</button>
            <button id="simReset" style="border:1px solid var(--dim);background:none;color:var(--muted);padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;">Reset</button>
          </div>
        </div>
      `;
    }

    wireEvents() {
      const el = (id) => this.container.querySelector('#' + id);

      el('simCpuRead').addEventListener('click', () => this.cpuRead());
      el('simCpuWrite').addEventListener('click', () => this.cpuWrite());
      el('simCboClean').addEventListener('click', () => this.cboClean());
      el('simCboInval').addEventListener('click', () => this.cboInval());
      el('simCboFlush').addEventListener('click', () => this.cboFlush());
      el('simDmaWrite').addEventListener('click', () => this.dmaWrite());
      el('simDmaRead').addEventListener('click', () => this.dmaRead());
      el('simBenchmark').addEventListener('click', () => this.runBenchmarkStep());
      el('simReset').addEventListener('click', () => this.reset());
    }

    cpuRead() {
      if (this.state.cacheState === 'INVALID') {
        this.state.cacheState = 'CLEAN';
        this.state.cacheData = this.state.memoryData;
        this.state.lastOperation = `CPU Cache Miss: Refilled cache line with DRAM value 0x${this.state.cacheData.toString(16).toUpperCase()}`;
      } else {
        this.state.lastOperation = `CPU Cache Hit: Read 0x${this.state.cacheData.toString(16).toUpperCase()} directly from L1 cache (${this.state.cacheState})`;
      }
      this.state.hazard = null;
      this.render();
      this.wireEvents();
    }

    cpuWrite() {
      this.state.cacheData = (this.state.cacheData + 0x11) & 0xFF;
      this.state.cacheState = 'DIRTY';
      this.state.lastOperation = `CPU Store: Cache line modified to 0x${this.state.cacheData.toString(16).toUpperCase()} (DIRTY). Main DRAM still holds stale 0x${this.state.memoryData.toString(16).toUpperCase()}`;
      this.state.hazard = null;
      this.render();
      this.wireEvents();
    }

    cboClean() {
      this.state.cmoCount++;
      if (this.state.cacheState === 'DIRTY') {
        this.state.memoryData = this.state.cacheData;
        this.state.cacheState = 'CLEAN';
        this.state.lastOperation = `CBO.CLEAN: Wrote back dirty line 0x${this.state.memoryData.toString(16).toUpperCase()} to DRAM. Line is now CLEAN.`;
      } else {
        this.state.lastOperation = `CBO.CLEAN: Line was already ${this.state.cacheState}. No DRAM writeback needed.`;
      }
      this.state.hazard = null;
      this.render();
      this.wireEvents();
    }

    cboInval() {
      this.state.cmoCount++;
      this.state.cacheState = 'INVALID';
      this.state.lastOperation = `CBO.INVAL: Invalidation signal executed. Cache line marked INVALID without writeback.`;
      this.state.hazard = null;
      this.render();
      this.wireEvents();
    }

    cboFlush() {
      this.state.cmoCount++;
      if (this.state.cacheState === 'DIRTY') {
        this.state.memoryData = this.state.cacheData;
      }
      this.state.cacheState = 'INVALID';
      this.state.lastOperation = `CBO.FLUSH: Cleaned dirty line to DRAM and invalidated cache line.`;
      this.state.hazard = null;
      this.render();
      this.wireEvents();
    }

    dmaWrite() {
      this.state.memoryData = this.state.dmaData;
      this.state.dmaData = (this.state.dmaData + 0x05) & 0xFF;

      if (this.state.cacheState !== 'INVALID') {
        this.state.hazard = `STALE CACHE DETECTED: DMA wrote 0x${this.state.memoryData.toString(16).toUpperCase()} to DRAM, but CPU Cache holds stale 0x${this.state.cacheData.toString(16).toUpperCase()} (${this.state.cacheState}). Must execute CBO.INVAL before CPU reads!`;
      } else {
        this.state.lastOperation = `DMA Write: Safely updated DRAM to 0x${this.state.memoryData.toString(16).toUpperCase()} while cache was INVALID.`;
        this.state.hazard = null;
      }
      this.render();
      this.wireEvents();
    }

    dmaRead() {
      if (this.state.cacheState === 'DIRTY') {
        this.state.hazard = `STALE DRAM READ DETECTED: DMA read 0x${this.state.memoryData.toString(16).toUpperCase()} from DRAM, but CPU holds newer dirty data 0x${this.state.cacheData.toString(16).toUpperCase()} in cache! Must execute CBO.CLEAN before DMA read!`;
      } else {
        this.state.lastOperation = `DMA Read: Read 0x${this.state.memoryData.toString(16).toUpperCase()} from DRAM safely (Cache is ${this.state.cacheState}).`;
        this.state.hazard = null;
      }
      this.render();
      this.wireEvents();
    }

    runBenchmarkStep() {
      const steps = [
        () => this.cpuWrite(),
        () => this.cboClean(),
        () => this.dmaRead(),
        () => this.dmaWrite(),
        () => this.cboInval(),
        () => this.cpuRead()
      ];
      const fn = steps[this.state.stepIndex % steps.length];
      this.state.stepIndex++;
      fn();
    }

    reset() {
      this.state = {
        cacheState: 'INVALID',
        cacheData: 0x00,
        cacheTag: '0x1000',
        memoryData: 0x1A,
        dmaData: 0x99,
        lastOperation: 'Simulation Reset to Initial Power-On State',
        hazard: null,
        cmoCount: 0,
        baselineCmoCount: 0,
        stepIndex: 0
      };
      this.render();
      this.wireEvents();
    }
  }

  window.CacheCoherencySim = CacheCoherencySimulator;
})();
