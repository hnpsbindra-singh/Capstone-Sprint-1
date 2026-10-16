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
    background: "#09090b",
    borderTop: "1px solid rgba(255, 255, 255, 0.12)",
    padding: "14px 20px",
    paddingBottom: "max(14px, env(safe-area-inset-bottom))",
    boxShadow: "0 -8px 24px rgba(0, 0, 0, 0.25)",
    animation: "slideUpBanner 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  };

  const iconWrap = {
    width: "44px", height: "44px", borderRadius: "10px", flexShrink: 0,
    background: "#0284c7",
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  const titleS = { color: "#ffffff", fontSize: "14px", fontWeight: 700, lineHeight: 1.3 };
  const subS   = { color: "#a1a1aa", fontSize: "12px", marginTop: "2px" };
  const btnS   = {
    background: "#0284c7",
    color: "#ffffff", border: "1px solid #0369a1", borderRadius: "8px", padding: "8px 16px",
    fontSize: "13px", fontWeight: 700, cursor: "pointer",
    display: "flex", alignItems: "center", gap: "6px", flexShrink: 0,
    whiteSpace: "nowrap", transition: "all 140ms ease"
  };
  const xBtn = {
    background: "transparent", color: "#a1a1aa", border: "none",
    padding: "8px", cursor: "pointer", display: "flex", alignItems: "center",
    borderRadius: "6px", flexShrink: 0,
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
