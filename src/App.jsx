import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Survey from "./pages/Survey";
import Results from "./pages/Results";
import "./App.css";

function GlobalStyles() {
  return (
    <style>{`
      :root{
        --gv-brand:#2f63d4;
        --gv-brand-2:#244fb0;
        --gv-bg:#f4f6fb;
        --gv-card:#ffffff;
        --gv-text:#0f172a;
        --gv-muted:#64748b;
        --gv-border:#d8deea;
        --gv-shadow: 0 18px 55px rgba(15, 23, 42, 0.10);
        --gv-shadow-sm: 0 8px 26px rgba(15, 23, 42, 0.08);
        --gv-radius: 16px;
      }

      html, body { height: 100%; width: 100%; }
      body {
        margin: 0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
        background: var(--gv-bg);
        color: var(--gv-text);
      }

      #root{
        width: 100%;
        max-width: none;
      }

      .gv-topbar{
        height: 44px;
        width: 100%;
        max-width: none;
        margin: 0;
        padding: 0 22px;
        box-sizing: border-box;

        background: var(--gv-brand);
        color: #fff;

        display:flex;
        align-items:center;
        justify-content:space-between;

        position: sticky;
        top: 0;
        z-index: 9999;
      }

      .gv-brand{
        font-weight: 800;
        letter-spacing: .2px;
        font-size: 18px;
        white-space: nowrap;
      }

      .gv-lang{
        display:flex;
        gap:10px;
        align-items:center;
      }

      .gv-chip{
        appearance: none;
        -webkit-appearance: none;

        border: 1px solid rgba(15, 23, 42, 0.18);
        background: rgba(255,255,255,0.95);
        color: #0f172a;

        border-radius: 10px;
        padding: 8px 12px;
        font-weight: 800;
        font-size: 13px;
        cursor:pointer;

        box-shadow: 0 2px 10px rgba(0,0,0,0.14);

        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .gv-chip:hover{ background: #ffffff; }

      .gv-shell{
        min-height: calc(100vh - 64px);
        padding: 44px 18px 56px;
      }

      .gv-stepper{
        max-width: 980px;
        margin: 0 auto 26px;
        padding-top: 6px;
        display:flex;
        justify-content:center;
        gap: 34px;
        align-items:flex-start;
      }
      .gv-step{
        display:flex;
        flex-direction:column;
        align-items:center;
        gap: 8px;
        min-width: 110px;
      }
      .gv-step .dot{
        width: 18px;
        height: 18px;
        border-radius: 999px;
        border: 2px solid var(--gv-border);
        background: #fff;
        box-shadow: 0 1px 0 rgba(0,0,0,0.04);
      }
      .gv-step.active .dot{
        border-color: var(--gv-brand);
        background: #fff;
        box-shadow: 0 0 0 4px rgba(47, 99, 212, 0.15);
      }
      .gv-step.done .dot{
        border-color: var(--gv-brand);
        background: var(--gv-brand);
      }
      .gv-step label{
        font-size: 12px;
        color: var(--gv-muted);
        font-weight: 700;
      }

      .gv-card{
        max-width: 860px;
        margin: 0 auto;
        background: var(--gv-card);
        border: 1px solid rgba(216, 222, 234, 0.7);
        border-radius: var(--gv-radius);
        box-shadow: var(--gv-shadow);
        padding: 38px 30px;
        text-align:center;
      }
      .gv-card h1, .gv-card h2{ margin: 0; }
      .gv-card h2{ font-size: 30px; letter-spacing: -0.3px; }

      .gv-sub{
        margin-top: 8px;
        color: var(--gv-muted);
        font-size: 14px;
      }
      .gv-q{
        margin-top: 26px;
        font-size: 16px;
        font-weight: 800;
      }

      .gv-input{
        width: min(420px, 100%);
        padding: 12px 14px;
        border-radius: 12px;
        border: 2px solid var(--gv-border);
        outline: none;
        font-size: 16px;
        margin-top: 10px;
        transition: box-shadow .15s ease, border-color .15s ease;
      }
      .gv-input:focus{
        border-color: var(--gv-brand);
        box-shadow: 0 0 0 4px rgba(47, 99, 212, 0.15);
      }

      .gv-options{
        margin-top: 14px;
        display:flex;
        justify-content:center;
        gap: 14px;
        flex-wrap: wrap;
      }
      .gv-option{
        min-width: 160px;
        padding: 14px 18px;
        border-radius: 12px;
        border: 2px solid var(--gv-border);
        background: #fff;
        font-weight: 800;
        cursor: pointer;
        transition: all .15s ease;
        color: var(--gv-text);
      }
      .gv-option.selected{
        border-color: var(--gv-brand);
        background: rgba(47, 99, 212, 0.10);
        color: var(--gv-brand-2);
      }

      .gv-footer{
        margin-top: 18px;
        display:flex;
        justify-content:center;
        gap: 12px;
      }
      .gv-btn{
        border: none;
        border-radius: 12px;
        padding: 12px 18px;
        font-weight: 800;
        font-size: 15px;
        cursor: pointer;
      }
      .gv-btn.primary{
        background: var(--gv-brand);
        color: #fff;
        box-shadow: var(--gv-shadow-sm);
      }
      .gv-btn.primary:disabled{
        cursor: not-allowed;
        opacity: 0.55;
        box-shadow: none;
      }
      .gv-btn.ghost{
        background: transparent;
        border: 1px solid var(--gv-border);
        color: var(--gv-text);
      }

      .gv-error{ color: #b91c1c; margin-top: 12px; font-weight: 700; }
    `}</style>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <GlobalStyles />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}