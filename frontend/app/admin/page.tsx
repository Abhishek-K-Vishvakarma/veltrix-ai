"use client";

import { useState } from "react";

type Theme = "paper" | "lab";

export default function AdminDashboard() {
  const [theme, setTheme] = useState<Theme>("paper");
  const [activeView, setActiveView] = useState("Dashboard");

  const navigation = [
    {
      title: "WORKSPACE",
      items: [
        { icon: "⌂", label: "Dashboard" },
        { icon: "✦", label: "New Analysis" },
        { icon: "◷", label: "History" },
      ],
    },
    {
      title: "INTELLIGENCE",
      items: [
        { icon: "◇", label: "Insights" },
        { icon: "▦", label: "Analytics" },
        { icon: "◈", label: "Knowledge" },
      ],
    },
    {
      title: "LIBRARY",
      items: [
        { icon: "▣", label: "Projects" },
        { icon: "□", label: "Documents" },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { icon: "⚙", label: "Settings" },
        { icon: "?", label: "Help" },
      ],
    },
  ];

  const stats = [
    { label: "Analyses", value: "128" },
    { label: "Avg Confidence", value: "94.7%" },
    { label: "Problems Solved", value: "36" },
    { label: "Time Saved", value: "12.4h" },
  ];

  return (
    <div
      data-theme={theme}
      className="veltrix-admin"
    >
      <style jsx global>{`
        :root {
          color-scheme: light;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          border-radius: 0;
        }

        html,
        body {
          min-height: 100%;
        }

        body {
          margin: 0;
        }

        .veltrix-admin {
          --bg: #f6f4ee;
          --c: #fff;
          --sand: #efebdf;
          --ln: #e4e0d5;
          --ink: #14130f;
          --m: #6f6a5e;
          --pri: #14130f;
          --pf: #f6f4ee;
          --sig: #ff4a1c;
          --ok: #0e7c66;

          min-height: 100vh;
          background: var(--bg);
          color: var(--ink);
          font: 13.5px/1.5 "Instrument Sans", "Segoe UI", Helvetica, Arial,
            sans-serif;
          display: flex;
        }

        .veltrix-admin[data-theme="lab"] {
          --bg: #f4f7f6;
          --c: #fff;
          --sand: #e8efec;
          --ln: #dce5e1;
          --ink: #0b1f1c;
          --m: #5b706b;
          --pri: #0f766e;
          --pf: #fff;
          --sig: #f59e0b;
          --ok: #0f766e;
        }

        .veltrix-admin button {
          font: inherit;
          color: inherit;
          cursor: pointer;
        }

        .veltrix-admin .btn {
          height: 30px;
          padding: 0 12px;
          border: 1px solid var(--ln);
          background: var(--c);
          font-size: 12.5px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s;
        }

        .veltrix-admin .btn:hover {
          background: var(--sand);
          border-color: var(--ink);
        }

        .veltrix-admin .btn:active {
          transform: translateY(1px);
        }

        .veltrix-admin .btn:focus-visible {
          outline: 2px solid var(--sig);
          outline-offset: 2px;
        }

        .veltrix-admin .btn.on {
          background: var(--ink);
          color: var(--bg);
          border-color: var(--ink);
        }

        .veltrix-admin aside {
          width: 224px;
          padding: 18px 12px;
          border-right: 1px solid var(--ln);
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex-shrink: 0;
        }

        .veltrix-admin .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          letter-spacing: 3px;
          padding: 2px 8px 16px;
        }

        .veltrix-admin aside h6 {
          font-size: 10px;
          letter-spacing: 1.6px;
          color: var(--m);
          margin: 14px 10px 4px;
        }

        .veltrix-admin aside a {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          color: var(--m);
          cursor: pointer;
          border: 1px solid transparent;
          position: relative;
          transition: all 0.15s;
          user-select: none;
        }

        .veltrix-admin aside a i {
          font-style: normal;
          width: 16px;
          text-align: center;
        }

        .veltrix-admin aside a:hover {
          background: var(--sand);
          color: var(--ink);
        }

        .veltrix-admin aside a.on {
          background: var(--c);
          color: var(--ink);
          font-weight: 600;
          border-color: var(--ink);
        }

        .veltrix-admin aside a.on::before {
          content: "";
          position: absolute;
          left: -1px;
          top: -1px;
          bottom: -1px;
          width: 4px;
          background: var(--sig);
        }

        .veltrix-admin aside a.on i {
          color: var(--sig);
        }

        .veltrix-admin .st {
          margin-top: auto;
          padding: 8px 10px;
          color: var(--m);
          font-size: 12px;
        }

        .veltrix-admin .st b {
          display: inline-block;
          width: 7px;
          height: 7px;
          background: var(--ok);
          margin-right: 6px;
        }

        .veltrix-admin main {
          flex: 1;
          padding: 22px 32px 34px;
          min-width: 0;
          max-width: 1100px;
        }

        .veltrix-admin .top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 22px;
          flex-wrap: wrap;
        }

        .veltrix-admin .crumb,
        .veltrix-admin .seg {
          color: var(--m);
          font-size: 12.5px;
        }

        .veltrix-admin .crumb b {
          color: var(--ink);
          font-weight: 600;
        }

        .veltrix-admin .seg {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .veltrix-admin h1 {
          font-size: 28px;
          font-weight: 650;
          letter-spacing: -0.5px;
        }

        .veltrix-admin h1 b {
          color: var(--sig);
        }

        .veltrix-admin .sub {
          color: var(--m);
          margin: 2px 0 18px;
        }

        .veltrix-admin .box,
        .veltrix-admin .card {
          background: var(--c);
          border: 1px solid var(--ln);
          padding: 16px;
          transition: border-color 0.15s;
        }

        .veltrix-admin .card:hover,
        .veltrix-admin .box:hover {
          border-color: var(--ink);
        }

        .veltrix-admin textarea {
          width: 100%;
          border: 0;
          outline: 0;
          resize: none;
          background: none;
          font: inherit;
          color: var(--ink);
          height: 60px;
        }

        .veltrix-admin .bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .veltrix-admin .bar > div {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .veltrix-admin .grid {
          display: grid;
          gap: 12px;
          margin-top: 14px;
        }

        .veltrix-admin .g4 {
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }

        .veltrix-admin .g2 {
          grid-template-columns: 2fr 1fr;
        }

        .veltrix-admin small {
          color: var(--m);
          font-size: 10.5px;
          letter-spacing: 0.9px;
          text-transform: uppercase;
        }

        .veltrix-admin .n {
          display: block;
          font-size: 26px;
          font-weight: 500;
          margin-top: 2px;
        }

        .veltrix-admin .mono {
          font-family: "JetBrains Mono", ui-monospace, monospace;
        }

        .veltrix-admin svg {
          display: block;
        }

        .veltrix-admin .ch {
          width: 100%;
          height: auto;
        }

        .veltrix-admin .cat {
          display: flex;
          height: 14px;
          margin: 14px 0 10px;
        }

        .veltrix-admin .cat i {
          display: block;
        }

        .veltrix-admin .leg {
          font-size: 12px;
          color: var(--m);
          display: grid;
          gap: 4px;
        }

        .veltrix-admin .leg s {
          display: inline-block;
          width: 8px;
          height: 8px;
          margin-right: 6px;
          text-decoration: none;
        }

        .veltrix-admin .row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          padding: 10px 8px;
          margin: 0 -8px;
          border-top: 1px solid var(--ln);
          cursor: pointer;
          transition: background 0.15s;
        }

        .veltrix-admin .row:hover {
          background: var(--sand);
        }

        .veltrix-admin .row em {
          color: var(--m);
          font-style: normal;
        }

        .veltrix-admin .tag {
          font-size: 11px;
          padding: 1px 8px;
          background: var(--sand);
          margin-left: 8px;
          color: var(--m);
        }

        @media (max-width: 760px) {
          .veltrix-admin aside {
            display: none;
          }

          .veltrix-admin main {
            padding: 18px;
          }

          .veltrix-admin .g2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <aside>
        <div className="logo">
          <svg width="28" height="28" viewBox="0 0 72 72">
            <rect width="72" height="72" fill="#14130F" />
            <rect
              x="1.5"
              y="1.5"
              width="69"
              height="69"
              fill="none"
              stroke="#F6F4EE"
              strokeOpacity=".14"
            />
            <path
              d="M19 19 L36 53 L53 19"
              fill="none"
              stroke="#F6F4EE"
              strokeWidth="4"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
            <rect
              x="14"
              y="14"
              width="10"
              height="10"
              fill="#14130F"
              stroke="#F6F4EE"
              strokeWidth="3"
            />
            <rect
              x="48"
              y="14"
              width="10"
              height="10"
              fill="#14130F"
              stroke="#F6F4EE"
              strokeWidth="3"
            />
            <path
              d="M36 31 V53"
              stroke="#FF4A1C"
              strokeWidth="3"
              strokeLinecap="square"
            />
            <rect
              x="26"
              y="21"
              width="20"
              height="20"
              fill="none"
              stroke="#FF4A1C"
              strokeOpacity=".45"
              strokeWidth="2"
              transform="rotate(45 36 31)"
            />
            <rect
              x="31"
              y="26"
              width="10"
              height="10"
              fill="#FF4A1C"
              transform="rotate(45 36 31)"
            />
          </svg>
          VELTR<span style={{ color: "var(--sig)" }}>I</span>X
        </div>

        {navigation.map((section) => (
          <div key={section.title}>
            <h6>{section.title}</h6>

            {section.items.map((item) => (
              <a
                key={item.label}
                className={activeView === item.label ? "on" : ""}
                onClick={() => setActiveView(item.label)}
              >
                <i>{item.icon}</i>
                {item.label}
              </a>
            ))}
          </div>
        ))}

        <div className="st">
          <b></b>
          AI Online
        </div>
      </aside>

      <main>
        <div className="top">
          <div className="crumb">
            Workspace / <b>{activeView}</b>
          </div>

          <div className="seg">
            Theme

            <button
              className={`btn ${theme === "paper" ? "on" : ""}`}
              onClick={() => setTheme("paper")}
            >
              Paper
            </button>

            <button
              className={`btn ${theme === "lab" ? "on" : ""}`}
              onClick={() => setTheme("lab")}
            >
              Lab
            </button>
          </div>
        </div>

        <section>
          <h1>
            Good morning, Abhishek<b>.</b>
          </h1>

          <p className="sub">
            Give me the evidence. I'll show you what to do next.
          </p>

          <div className="box">
            <textarea placeholder="Describe a problem..." />

            <div className="bar">
              <div>
                <button className="btn">📎 Upload</button>
                <button className="btn">📷 Image</button>
                <button className="btn">📄 File</button>
              </div>

              <button className="btn" style={{
                background: "var(--pri)",
                color: "var(--pf)",
                borderColor: "var(--pri)"
              }}>
                Analyze →
              </button>
            </div>
          </div>

          <div className="grid g4">
            {stats.map((stat) => (
              <div className="card" key={stat.label}>
                <small>{stat.label}</small>
                <span className="n mono">{stat.value}</span>
              </div>
            ))}
          </div>

          <div className="grid g2">
            <div className="card">
              <small>Analysis Activity</small>

              <svg className="ch" viewBox="0 0 400 130">
                <path
                  d="M0 125 H400"
                  stroke="var(--ln)"
                />

                <path
                  d="M0 105 L60 85 L120 95 L180 55 L240 66 L300 36 L360 46 L400 18"
                  fill="none"
                  stroke="var(--ink)"
                  strokeWidth="2.5"
                  strokeLinejoin="miter"
                />

                <rect
                  x="394"
                  y="12"
                  width="12"
                  height="12"
                  fill="var(--sig)"
                />
              </svg>
            </div>

            <div className="card">
              <small>Categories</small>

              <div className="cat">
                <i
                  style={{
                    width: "40%",
                    background: "var(--ink)",
                  }}
                />
                <i
                  style={{
                    width: "26%",
                    background: "var(--sig)",
                  }}
                />
                <i
                  style={{
                    width: "20%",
                    background: "var(--ok)",
                  }}
                />
                <i
                  style={{
                    width: "14%",
                    background: "var(--ln)",
                  }}
                />
              </div>

              <div className="leg">
                <span>
                  <s style={{ background: "var(--ink)" }} />
                  Financial 40%
                </span>

                <span>
                  <s style={{ background: "var(--sig)" }} />
                  Technical 26%
                </span>

                <span>
                  <s style={{ background: "var(--ok)" }} />
                  Documents 20%
                </span>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 12 }}>
            <small>Recent Intelligence</small>

            <div className="row">
              <span>
                Electricity Bill
                <span className="tag">3 evidence</span>
              </span>

              <em>Today</em>
            </div>

            <div className="row">
              <span>
                Contract Analysis
                <span className="tag">PDF</span>
              </span>

              <em>Yesterday</em>
            </div>

            <div className="row">
              <span>
                Device Inspection
                <span className="tag">Image</span>
              </span>

              <em>Sep 30</em>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}