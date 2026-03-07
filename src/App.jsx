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

      html, body { 
        height: 100%; 
        width: 100%; 
        margin: 0;
        padding: 0;
      }
      body {
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
        background: var(--gv-bg);
        color: var(--gv-text);
        min-height: 100vh;
      }

      #root{
        width: 100%;
        max-width: none;
        min-height: 100vh;
        background: var(--gv-bg);
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
        flex-shrink: 0;
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
        min-height: calc(100vh - 44px);
        padding: 32px 18px 56px;
        width: 100%;
        box-sizing: border-box;
      }

      .gv-stepper{
        max-width: 980px;
        margin: 0 auto 30px auto;
        display:flex;
        justify-content:space-between;
        align-items:center;
        position: relative;
      }

      /* background progress line */
      .gv-stepper::before{
        content:"";
        position:absolute;
        top:11px;
        left:40px;
        right:40px;
        height:3px;
        background:var(--gv-border);
        z-index:0;
      }

      .gv-step{
        display:flex;
        flex-direction:column;
        align-items:center;
        gap:8px;
        min-width:137px;
        position:relative;
        z-index:1;
      }

      .gv-step .dot{
        width:22px;
        height:22px;
        border-radius:999px;
        border:2px solid var(--gv-border);
        background:#fff;
        box-shadow:0 1px 0 rgba(0,0,0,0.04);
      }

      /* completed steps */
      .gv-step.done .dot{
        border-color:var(--gv-brand);
        background:var(--gv-brand);
      }

      /* active step */
      .gv-step.active .dot{
        border-color:var(--gv-brand);
        background:#fff;
        box-shadow:0 0 0 5px rgba(47, 99, 212, 0.15);
      }
      .gv-step.done .dot{
        border-color: var(--gv-brand);
        background: var(--gv-brand);
      }
      .gv-step label{
        font-size: 15px;
        color: var(--gv-muted);
        font-weight: 700;
      }

      .gv-card{
        max-width: 1075px;
        margin: 0 auto;
        background: var(--gv-card);
        border: 1px solid rgba(216, 222, 234, 0.7);
        border-radius: var(--gv-radius);
        box-shadow: var(--gv-shadow);
        padding: 60px 38px 48px 38px;
        text-align:center;
        overflow: visible;
      }
      .gv-card h1, .gv-card h2{ margin: 0; padding-top: 20px; }
      .gv-card h2{ font-size: 37px; letter-spacing: -0.3px; }

      .gv-sub{
        margin-top: 10px;
        color: var(--gv-muted);
        font-size: 17px;
      }
      .gv-q{
        margin-top: 32px;
        font-size: 20px;
        font-weight: 800;
      }

      .gv-input{
        width: min(525px, 100%);
        padding: 15px 17px;
        border-radius: 12px;
        border: 2px solid var(--gv-border);
        outline: none;
        font-size: 20px;
        margin-top: 12px;
        transition: box-shadow .15s ease, border-color .15s ease;
      }
      .gv-input:focus{
        border-color: var(--gv-brand);
        box-shadow: 0 0 0 5px rgba(47, 99, 212, 0.15);
      }

      .gv-options{
        margin-top: 17px;
        display:flex;
        justify-content:center;
        gap: 17px;
        flex-wrap: wrap;
      }
      .gv-option{
        min-width: 200px;
        padding: 17px 22px;
        border-radius: 12px;
        border: 2px solid var(--gv-border);
        background: #fff;
        font-weight: 800;
        font-size: 18px;
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
        margin-top: 22px;
        display:flex;
        justify-content:center;
        gap: 15px;
      }
      .gv-btn{
        border: none;
        border-radius: 12px;
        padding: 15px 22px;
        font-weight: 800;
        font-size: 18px;
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

      .gv-error{ color: #b91c1c; margin-top: 15px; font-weight: 700; font-size: 16px; }
    `}</style>
  );
}

function Layout({ children }) {
  return (
    <>
      <header className="gv-topbar">
        <div className="gv-brand">SleepFit AI</div>
        <div className="gv-lang">
          <button className="gv-chip" type="button">English</button>
          <button className="gv-chip" type="button">Español</button>
        </div>
      </header>

      <main className="gv-shell">
        {children}
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <GlobalStyles />
        <Routes>
          <Route path="/" element={<Layout><Landing /></Layout>} />
          <Route path="/survey" element={<Layout><Survey /></Layout>} />
          <Route path="/results" element={<Layout><Results /></Layout>} />
        </Routes>
    </BrowserRouter>
  );
}