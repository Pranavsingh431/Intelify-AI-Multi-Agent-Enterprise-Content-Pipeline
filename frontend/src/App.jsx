import React from "react";
import { useState } from "react";
import InputBox from "./components/InputBox";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function App() {
  const [text, setText] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [compliance, setCompliance] = useState(null);
  const [expandedEvidence, setExpandedEvidence] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await fetch(`${backendUrl}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await result.json();
      if (!result.ok) {
        setGeneratedContent("");
        setCompliance(null);
        setExpandedEvidence({});
        setError(data?.detail || "Unable to process request.");
        return;
      }
      const content = data?.generated_content || data?.output || "";
      if (!content) {
        setGeneratedContent("");
        setCompliance(null);
        setExpandedEvidence({});
        setError("No generated content was returned by the backend.");
        return;
      }

      setGeneratedContent(content);
      setCompliance(data?.compliance || null);
      setExpandedEvidence({});
    } catch {
      setGeneratedContent("");
      setCompliance(null);
      setExpandedEvidence({});
      setError("Unable to process request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>Text Processor</h1>
        <InputBox
          value={text}
          onChange={setText}
          onSubmit={handleSubmit}
          loading={loading}
        />

        {error && <p style={styles.error}>{error}</p>}

        {generatedContent && (
          <div style={styles.responseBox}>
            <h2 style={styles.responseTitle}>Generated Content</h2>
            <div style={styles.content}>{generatedContent}</div>
          </div>
        )}

        {compliance && (
          <div style={styles.complianceBox}>
            <div style={styles.complianceHeader}>
              <h2 style={styles.responseTitle}>Compliance Check</h2>
              <div style={styles.trustScore}>
                Trust Score: {compliance.trust_score}
              </div>
            </div>

            <div style={styles.claimList}>
              {(compliance.claims || []).map((claim, index) => {
                const claimKey = `${claim.text}-${index}`;
                const evidence = claim.evidence || [];
                const isExpanded = Boolean(expandedEvidence[claimKey]);
                return (
                  <div key={claimKey} style={styles.claimItem}>
                  <div style={styles.claimTopRow}>
                    <p style={styles.claimText}>{claim.text}</p>
                    <span
                      style={{
                        ...styles.badge,
                        ...getBadgeStyle(claim.status),
                      }}
                    >
                      {claim.status}
                    </span>
                  </div>
                  <p style={styles.claimReason}>{claim.reason}</p>
                  {evidence.length > 0 && (
                    <button
                      type="button"
                      style={styles.evidenceButton}
                      onClick={() =>
                        setExpandedEvidence((prev) => ({
                          ...prev,
                          [claimKey]: !prev[claimKey],
                        }))
                      }
                    >
                      {isExpanded ? "Hide Evidence" : "View Evidence"}
                    </button>
                  )}

                    {isExpanded && evidence.length > 0 && (
                      <div style={styles.evidenceBox}>
                        <p style={styles.sourcesLabel}>Sources</p>
                        {evidence.slice(0, 3).map((item, evidenceIndex) => (
                          <div
                            key={`${claimKey}-evidence-${evidenceIndex}`}
                            style={styles.evidenceItem}
                          >
                            <span style={styles.evidenceTitle}>
                              {item.title || "Source"}
                            </span>
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={styles.evidenceLink}
                              >
                                Open
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function getBadgeStyle(status) {
  if (status === "SUPPORTED") {
    return {
      backgroundColor: "#ecfdf3",
      color: "#166534",
      borderColor: "#86efac",
    };
  }
  if (status === "UNSUPPORTED") {
    return {
      backgroundColor: "#fef2f2",
      color: "#991b1b",
      borderColor: "#fca5a5",
    };
  }
  return {
    backgroundColor: "#fefce8",
    color: "#854d0e",
    borderColor: "#fde68a",
  };
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    backgroundColor: "#f3f4f6",
    padding: "1.5rem",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: "640px",
    backgroundColor: "#ffffff",
    borderRadius: "0.75rem",
    border: "1px solid #e5e7eb",
    padding: "1.5rem",
    boxShadow: "0 10px 24px rgba(17, 24, 39, 0.06)",
  },
  title: {
    marginTop: 0,
    marginBottom: "1rem",
    fontSize: "1.5rem",
    color: "#111827",
  },
  responseBox: {
    marginTop: "1.25rem",
    borderTop: "1px solid #e5e7eb",
    paddingTop: "1rem",
    display: "grid",
    gap: "0.5rem",
  },
  complianceBox: {
    marginTop: "1.25rem",
    borderTop: "1px solid #e5e7eb",
    paddingTop: "1rem",
    display: "grid",
    gap: "0.75rem",
  },
  complianceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  trustScore: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#111827",
  },
  claimList: {
    display: "grid",
    gap: "0.75rem",
  },
  claimItem: {
    border: "1px solid #e5e7eb",
    borderRadius: "0.5rem",
    backgroundColor: "#ffffff",
    padding: "0.85rem",
    display: "grid",
    gap: "0.5rem",
  },
  claimTopRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "0.75rem",
    alignItems: "flex-start",
  },
  claimText: {
    margin: 0,
    color: "#111827",
    fontSize: "0.98rem",
    lineHeight: 1.5,
    flex: 1,
  },
  claimReason: {
    margin: 0,
    color: "#4b5563",
    fontSize: "0.92rem",
    lineHeight: 1.5,
  },
  evidenceButton: {
    justifySelf: "start",
    border: "1px solid #d1d5db",
    borderRadius: "0.4rem",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: "0.85rem",
    fontWeight: 600,
    padding: "0.35rem 0.6rem",
    cursor: "pointer",
  },
  evidenceBox: {
    display: "grid",
    gap: "0.45rem",
    borderLeft: "2px solid #e5e7eb",
    paddingLeft: "0.6rem",
  },
  sourcesLabel: {
    margin: 0,
    fontSize: "0.8rem",
    color: "#6b7280",
    fontWeight: 600,
  },
  evidenceItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.5rem",
  },
  evidenceTitle: {
    margin: 0,
    fontSize: "0.84rem",
    fontWeight: 500,
    color: "#4b5563",
    lineHeight: 1.5,
    flex: 1,
  },
  evidenceLink: {
    color: "#374151",
    fontSize: "0.8rem",
    fontWeight: 600,
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
  badge: {
    border: "1px solid",
    borderRadius: "999px",
    padding: "0.2rem 0.6rem",
    fontSize: "0.75rem",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  responseTitle: {
    margin: 0,
    fontSize: "1.1rem",
    color: "#111827",
  },
  content: {
    margin: 0,
    color: "#374151",
    fontSize: "1rem",
    lineHeight: 1.7,
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "0.5rem",
    padding: "1rem",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  error: {
    marginTop: "1rem",
    marginBottom: 0,
    color: "#b91c1c",
    fontWeight: 500,
  },
};
