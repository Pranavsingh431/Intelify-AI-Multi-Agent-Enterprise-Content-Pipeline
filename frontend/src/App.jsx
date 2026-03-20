import React, { useMemo, useState } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function App() {
  const [text, setText] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");

  const [generatedContent, setGeneratedContent] = useState("");
  const [compliance, setCompliance] = useState(null);
  const [workflowLogs, setWorkflowLogs] = useState([]);
  const [expandedClaims, setExpandedClaims] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetState();
    setIsRunning(true);

    try {
      const response = await fetch(`${backendUrl}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.detail || "Unable to process request.");
        return;
      }

      const pipeline = payload?.data || {};
      const content = pipeline.generated_content || "";
      if (!content) {
        setError("No generated content was returned by the backend.");
        return;
      }

      setGeneratedContent(content);
      setCompliance(pipeline.compliance || null);
      setWorkflowLogs(Array.isArray(pipeline.logs) ? pipeline.logs : []);
    } catch {
      setError("Unable to process request.");
    } finally {
      setIsRunning(false);
    }
  };

  const resetState = () => {
    setError("");
    setGeneratedContent("");
    setCompliance(null);
    setWorkflowLogs([]);
    setExpandedClaims({});
  };

  const generatedPreview = useMemo(() => {
    if (!generatedContent) {
      return "[SYSTEM] Awaiting execution...";
    }
    return truncate(generatedContent, 1000);
  }, [generatedContent]);

  const trustScore = Number(compliance?.trust_score || 0);
  const trustPercent = Math.max(0, Math.min(100, Number((trustScore * 100).toFixed(2))));

  return (
    <div className="min-h-screen bg-[#131313] text-[#e2e2e2] font-body">
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#353535] bg-[#131313] px-6 text-sm uppercase tracking-wider">
        <div className="font-headline text-xl font-bold text-white">AI Workflow Studio</div>
        <div className="hidden items-center gap-8 md:flex">
          <span className="border-b-2 border-white py-1 text-white">Studio</span>
          <span className="text-gray-500">Library</span>
          <span className="text-gray-500">Agents</span>
          <span className="text-gray-500">Settings</span>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <span className="material-symbols-outlined">notifications</span>
          <span className="material-symbols-outlined">account_circle</span>
        </div>
      </header>

      <div className="flex h-screen pt-16">
        <aside className="hidden h-full w-64 flex-col border-r border-[#353535] bg-[#0e0e0e] md:flex">
          <div className="border-b border-[#353535] p-6">
            <div className="font-headline text-lg font-bold text-white">OPERATOR_01</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-[#72ff70]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#72ff70]" />
              SYSTEM_READY
            </div>
          </div>

          <nav className="flex-1 py-4 text-sm">
            <div className="px-4 pb-4">
              <button
                type="button"
                className="w-full bg-white py-3 font-headline text-xs font-bold uppercase tracking-widest text-black"
              >
                NEW WORKFLOW
              </button>
            </div>

            <ul className="space-y-1 px-2">
              <li className="flex items-center gap-3 rounded bg-white px-4 py-3 text-black">
                <span className="material-symbols-outlined text-base">grid_view</span>
                <span>Studio</span>
              </li>
              <li className="flex items-center gap-3 px-4 py-3 text-gray-400"> 
                <span className="material-symbols-outlined text-base">folder_open</span>
                <span>Library</span>
              </li>
              <li className="flex items-center gap-3 px-4 py-3 text-gray-400">
                <span className="material-symbols-outlined text-base">smart_toy</span>
                <span>Agents</span>
              </li>
              <li className="flex items-center gap-3 px-4 py-3 text-gray-400">
                <span className="material-symbols-outlined text-base">settings</span>
                <span>Settings</span>
              </li>
            </ul>
          </nav>

          <div className="space-y-2 border-t border-[#353535] p-4 text-[11px] text-gray-500">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">sensors</span>
              <span>System Health: 98%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">timer</span>
              <span>Uptime: 14d</span>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-[#131313]">
          <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 p-8">
            <section className="col-span-12 space-y-6 lg:col-span-8">
              <div className="border border-[#353535] bg-[#1b1b1b] p-6">
                <h2 className="mb-4 text-xs uppercase tracking-[0.2em] text-[#919191]">Input Console / Prompt</h2>
                <form onSubmit={handleSubmit}>
                  <div className="relative">
                    <textarea
                      value={text}
                      onChange={(event) => setText(event.target.value)}
                      className="h-36 w-full resize-none border border-[#474747] bg-[#0e0e0e] p-4 text-base text-white outline-none placeholder:text-[#474747]"
                      placeholder="ENTER WORKFLOW PARAMETERS..."
                      required
                    />
                    <div className="absolute bottom-4 right-4 flex items-center gap-4">
                      <span className="text-[10px] text-[#919191]">CHARS: {text.length}</span>
                      <button
                        type="submit"
                        disabled={isRunning}
                        className="flex items-center gap-1 bg-white px-5 py-2 text-xs font-bold uppercase tracking-widest text-black disabled:opacity-60"
                      >
                        <span className="material-symbols-outlined text-sm">play_arrow</span>
                        {isRunning ? "RUNNING" : "RUN_PIPELINE"}
                      </button>
                    </div>
                  </div>
                </form>
                {error && <p className="mt-3 text-xs text-[#ffb4ab]">{error}</p>}
              </div>

              <div className="bg-[#1b1b1b] p-1">
                <div className="border border-[#474747] bg-[#0e0e0e] p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xs uppercase tracking-[0.2em] text-[#919191]">Generated Output / Log</h2>
                    <div className="flex gap-2">
                      <span className="h-2 w-2 bg-[#72ff70]" />
                      <span className="h-2 w-2 bg-[#474747]" />
                      <span className="h-2 w-2 bg-[#474747]" />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm leading-relaxed text-[#c6c6c6]">
                    <p className="text-[#72ff70]">[SYSTEM] {isRunning ? "Running pipeline..." : "Ready."}</p>
                    <p className="whitespace-pre-wrap text-white">{generatedPreview}</p>
                  </div>
                </div>
              </div>
            </section>

            <aside className="col-span-12 space-y-6 lg:col-span-4">
              <div className="border border-[#474747] bg-[#1f1f1f] p-6">
                <h2 className="mb-6 text-xs uppercase tracking-[0.2em] text-[#919191]">Agent Trace</h2>
                <div className="space-y-4">
                  {workflowLogs.length === 0 && <p className="text-xs text-[#919191]">No steps yet.</p>}

                  {workflowLogs.map((log, idx) => (
                    <div key={`trace-${idx}`} className="flex items-start gap-4">
                      <div className="mt-0.5 h-5 w-5 rounded-full bg-[#72ff70]" />
                      <div>
                        <div className="text-xs font-bold uppercase">{getStepLabel(log.agent)}</div>
                        <div className="text-[10px] text-[#72ff70]">[DONE]</div>
                      </div>
                    </div>
                  ))}

                  {isRunning && workflowLogs.length === 0 && (
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 h-5 w-5 animate-pulse rounded-full border border-white" />
                      <div>
                        <div className="text-xs font-bold uppercase">Initializing</div>
                        <div className="text-[10px] text-white">[PENDING]</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#353535] p-6">
                <div className="mb-6 space-y-2 text-center">
                  <h2 className="text-[10px] uppercase tracking-[0.3em] text-[#c6c6c6]">Trust Score</h2>
                  <div className="text-5xl font-bold tracking-tight text-[#72ff70]">{trustPercent.toFixed(2)}%</div>
                  <div className="mt-3 h-1 w-full bg-[#1f1f1f]">
                    <div className="h-full bg-[#72ff70]" style={{ width: `${trustPercent}%` }} />
                  </div>
                </div>

                <div className="space-y-4">
                  {(compliance?.claims || []).slice(0, 3).map((claim, index) => {
                    const claimKey = `claim-${index}`;
                    const isExpanded = Boolean(expandedClaims[claimKey]);
                    const evidence = claim.evidence || [];

                    return (
                      <div key={claimKey} className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="max-w-[70%] truncate text-white">{truncate(claim.text, 32)}</span>
                          <span className={statusClass(claim.status)}>{`[${claim.status}]`}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedClaims((prev) => ({
                              ...prev,
                              [claimKey]: !prev[claimKey],
                            }))
                          }
                          className="text-[10px] text-[#919191]"
                        >
                          {isExpanded ? "Hide sources" : "View sources"}
                        </button>

                        {isExpanded && (
                          <div className="space-y-1 pl-2 text-[10px] text-[#919191]">
                            {evidence.length === 0 && <p>No evidence links</p>}
                            {evidence.slice(0, 2).map((item, evidenceIndex) => (
                              <a
                                key={`${claimKey}-${evidenceIndex}`}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block truncate hover:text-white"
                              >
                                {item.title || "Source"}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>

          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-8 pb-8 md:grid-cols-3">
            <StatusCard icon="memory" label="Node Utilization" value="42.8 GB / 128 GB" />
            <StatusCard icon="lan" label="Stream Latency" value="14ms AVG" />
            <StatusCard icon="security" label="Security Layer" value="ENCRYPTED" valueClass="text-[#72ff70]" />
          </div>
        </main>
      </div>

      <div className="pointer-events-none fixed right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/[0.02] to-transparent" />
    </div>
  );
}

function StatusCard({ icon, label, value, valueClass = "" }) {
  return (
    <div className="flex items-center gap-4 border border-[#474747] bg-[#1b1b1b] p-4">
      <div className="bg-[#353535] p-3">
        <span className="material-symbols-outlined text-white">{icon}</span>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-[#919191]">{label}</div>
        <div className={`text-lg font-bold ${valueClass}`}>{value}</div>
      </div>
    </div>
  );
}

function getStepLabel(agent) {
  if (agent === "content_agent") return "CONTENT GENERATION";
  if (agent === "compliance_agent") return "COMPLIANCE CHECK";
  return "AGENT STEP";
}

function statusClass(status) {
  if (status === "SUPPORTED") return "text-[#72ff70]";
  if (status === "UNSUPPORTED") return "text-[#ffb4ab]";
  return "text-[#919191]";
}

function truncate(value, limit) {
  if (!value) return "";
  if (value.length <= limit) return value;
  return `${value.slice(0, limit)}...`;
}
