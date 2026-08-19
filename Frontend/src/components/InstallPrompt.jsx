import React, { useState, useEffect } from "react";
import { MdDownload, MdClose, MdPhoneAndroid } from "react-icons/md";

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isIos = () => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  const isStandalone = () =>
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  useEffect(() => {
    if (isStandalone()) return;
    if (sessionStorage.getItem("pwa-dismissed")) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (isIos()) setTimeout(() => setShowIosTip(true), 3000);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowBanner(false);
    if (outcome === "accepted") sessionStorage.setItem("pwa-dismissed", "1");
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIosTip(false);
    sessionStorage.setItem("pwa-dismissed", "1");
    setDismissed(true);
  };

  if (dismissed) return null;

  const base = {
    position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
    background: "rgba(2, 52, 92, 0.97)",
    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    borderTop: "1px solid rgba(14, 165, 233, 0.3)",
    padding: "14px 20px",
    paddingBottom: "max(14px, env(safe-area-inset-bottom))",
    boxShadow: "0 -8px 32px rgba(2, 132, 199, 0.25)",
    animation: "slideUpBanner 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
  };

  const iconWrap = {
    width: "48px", height: "48px", borderRadius: "12px", flexShrink: 0,
    background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 12px rgba(2, 132, 199, 0.4)",
  };

  const titleS = { color: "#f0f9ff", fontSize: "15px", fontWeight: 700, lineHeight: 1.3 };
  const subS   = { color: "#94a3b8", fontSize: "12px", marginTop: "2px" };
  const btnS   = {
    background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
    color: "#fff", border: "none", borderRadius: "10px", padding: "10px 18px",
    fontSize: "14px", fontWeight: 700, cursor: "pointer",
    display: "flex", alignItems: "center", gap: "6px", flexShrink: 0,
    whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(2, 132, 199, 0.4)",
  };
  const xBtn = {
    background: "transparent", color: "#64748b", border: "none",
    padding: "8px", cursor: "pointer", display: "flex", alignItems: "center",
    borderRadius: "8px", flexShrink: 0,
  };

  return (
    <>
      <style>{`@keyframes slideUpBanner { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }`}</style>

      {showBanner && (
        <div style={{ ...base, display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={iconWrap}><MdPhoneAndroid size={26} color="#fff" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={titleS}>Install ResQFlow</div>
            <div style={subS}>Add to home screen for quick emergency access</div>
          </div>
          <button style={btnS} onClick={handleInstall}><MdDownload size={16} />Install</button>
          <button style={xBtn} onClick={handleDismiss}><MdClose size={20} /></button>
        </div>
      )}

      {showIosTip && !showBanner && (
        <div style={{ ...base, flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={iconWrap}><MdPhoneAndroid size={26} color="#fff" /></div>
              <div style={titleS}>Install ResQFlow on iOS</div>
            </div>
            <button style={xBtn} onClick={handleDismiss}><MdClose size={20} /></button>
          </div>
          <div style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.6 }}>
            Tap the <strong style={{ color: "#38bdf8" }}>Share</strong> button in Safari, then{" "}
            <strong style={{ color: "#38bdf8" }}>"Add to Home Screen"</strong>.
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPrompt;
