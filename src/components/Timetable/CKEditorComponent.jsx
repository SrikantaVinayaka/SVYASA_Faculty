import { useState, useRef, useEffect, useCallback } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// ─────────────────────────────────────────────────────────────────────────────
// BASE64 UPLOAD ADAPTER
// Converts uploaded image → base64 data URL, no server needed
// ─────────────────────────────────────────────────────────────────────────────
class Base64UploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file.then(
      (file) =>
        new Promise((resolve, reject) => {
          if (!file.type.startsWith("image/")) {
            reject("Only images allowed.");
            return;
          }
          if (file.size > 5 * 1024 * 1024) {
            reject("Max 5 MB.");
            return;
          }
          const reader = new FileReader();
          reader.onload = () => resolve({ default: reader.result });
          reader.onerror = () => reject("Read failed.");
          reader.readAsDataURL(file);
        }),
    );
  }
  abort() {}
}

function Base64UploadAdapterPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) =>
    new Base64UploadAdapter(loader);
}

// ─────────────────────────────────────────────────────────────────────────────
// EDITOR CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const EDITOR_CONFIG = {
  extraPlugins: [Base64UploadAdapterPlugin],
  toolbar: {
    items: [
      "undo",
      "redo",
      "|",
      "heading",
      "|",
      "bold",
      "italic",
      "|",
      "link",
      "imageUpload",
      "insertTable",
      "blockQuote",
      "|",
      "bulletedList",
      "numberedList",
      "outdent",
      "indent",
      "|",
      "specialCharacters",
    ],
  },
  // Minimal image toolbar — resize is handled by our custom overlay below
  image: {
    toolbar: [
      "imageStyle:inline",
      "imageStyle:block",
      "imageStyle:side",
      "|",
      "imageTextAlternative",
    ],
  },
  table: {
    contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MATH / FORMULA PANEL
// ─────────────────────────────────────────────────────────────────────────────
const SYMBOL_GROUPS = [
  {
    label: "Arithmetic",
    symbols: [
      { l: "√", v: "√" },
      { l: "±", v: "±" },
      { l: "×", v: "×" },
      { l: "÷", v: "÷" },
      { l: "≠", v: "≠" },
      { l: "≤", v: "≤" },
      { l: "≥", v: "≥" },
      { l: "≈", v: "≈" },
      { l: "∝", v: "∝" },
      { l: "²", v: "²" },
      { l: "³", v: "³" },
      { l: "⁻¹", v: "⁻¹" },
      { l: "½", v: "½" },
      { l: "¼", v: "¼" },
      { l: "¾", v: "¾" },
    ],
  },
  {
    label: "Calculus / Sets",
    symbols: [
      { l: "∑", v: "∑" },
      { l: "∫", v: "∫" },
      { l: "∂", v: "∂" },
      { l: "∞", v: "∞" },
      { l: "∆", v: "∆" },
      { l: "∇", v: "∇" },
      { l: "∈", v: "∈" },
      { l: "∉", v: "∉" },
      { l: "∩", v: "∩" },
      { l: "∪", v: "∪" },
      { l: "⊂", v: "⊂" },
      { l: "⊃", v: "⊃" },
      { l: "∀", v: "∀" },
      { l: "∃", v: "∃" },
    ],
  },
  {
    label: "Greek",
    symbols: [
      { l: "α", v: "α" },
      { l: "β", v: "β" },
      { l: "γ", v: "γ" },
      { l: "δ", v: "δ" },
      { l: "ε", v: "ε" },
      { l: "θ", v: "θ" },
      { l: "λ", v: "λ" },
      { l: "μ", v: "μ" },
      { l: "π", v: "π" },
      { l: "σ", v: "σ" },
      { l: "τ", v: "τ" },
      { l: "φ", v: "φ" },
      { l: "ω", v: "ω" },
      { l: "Γ", v: "Γ" },
      { l: "Δ", v: "Δ" },
      { l: "Σ", v: "Σ" },
      { l: "Φ", v: "Φ" },
      { l: "Ω", v: "Ω" },
    ],
  },
  {
    label: "Arrows",
    symbols: [
      { l: "→", v: "→" },
      { l: "←", v: "←" },
      { l: "↔", v: "↔" },
      { l: "⇒", v: "⇒" },
      { l: "⇔", v: "⇔" },
      { l: "↑", v: "↑" },
      { l: "↓", v: "↓" },
    ],
  },
];

function MathPanel({ editorRef }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [formula, setFormula] = useState("");

  function insertIntoEditor(text) {
    const editor = editorRef.current;
    if (!editor) return;
    const html = `<span style="font-family:'Times New Roman',serif;background:#eef2ff;padding:1px 6px;border-radius:4px;font-style:italic;color:#1e3a8a;border:1px solid #c7d2fe;">${text}</span>`;
    const viewFrag = editor.data.processor.toView(html);
    const modelFrag = editor.data.toModel(viewFrag);
    editor.model.insertContent(modelFrag);
    editor.editing.view.focus();
  }

  function handleInsert() {
    if (!formula.trim()) return;
    insertIntoEditor(formula.trim());
    setFormula("");
  }

  return (
    <div className="border-t border-border bg-[#f8f9fb]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 text-[11.5px] font-semibold text-[#9B2335] hover:bg-[#fdf0f2] transition select-none"
      >
        <span className="text-[16px] leading-none">∑</span>
        <span>Math &amp; Formula</span>
        <span className="ml-auto text-[10px] text-text2">
          {open ? "▲ Hide" : "▼ Show"}
        </span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2.5">
          <div className="flex gap-1 mt-1 flex-wrap">
            {SYMBOL_GROUPS.map((g, i) => (
              <button
                key={g.label}
                type="button"
                onClick={() => setTab(i)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  tab === i
                    ? "bg-[#9B2335] text-white"
                    : "bg-white border border-border text-text2 hover:text-text"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {SYMBOL_GROUPS[tab].symbols.map((s) => (
              <button
                key={s.v}
                type="button"
                title={`Insert ${s.v}`}
                onClick={() => insertIntoEditor(s.v)}
                className="w-9 h-9 rounded-lg border border-border bg-white text-[14px] font-semibold text-[#1e3a8a] hover:bg-[#eef2ff] hover:border-indigo-300 transition"
              >
                {s.l}
              </button>
            ))}
          </div>
          <div>
            <p className="text-[10.5px] text-text2 font-semibold uppercase tracking-wider mb-1.5">
              Type full expression &amp; insert
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInsert()}
                placeholder="e.g.  x² + y² = r²   or   ∫₀^∞ e⁻ˣ dx"
                className="flex-1 border border-border rounded-lg px-3 py-1.5 text-[13px] italic text-[#1e3a8a] outline-none focus:border-[#9B2335] bg-white transition"
                style={{ fontFamily: "'Times New Roman', serif" }}
              />
              <button
                type="button"
                onClick={handleInsert}
                className="px-3 py-1.5 rounded-lg bg-[#9B2335] text-white text-[12px] font-bold hover:bg-[#7A1A28] transition whitespace-nowrap"
              >
                Insert
              </button>
            </div>
            <p className="text-[10px] text-text2 mt-1">
              Click a symbol to insert at cursor, or type an expression and
              press Insert / Enter.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE RESIZE OVERLAY
// Renders 4 draggable corner handles + 4 edge handles over every <img> in the
// editor — exactly like Word / Google Docs. Works by positioning an absolutely-
// placed overlay div on top of each image whenever it is hovered or active.
// When the user drags a handle the overlay updates the img width live, then on
// mouseup writes the final width% back into the CKEditor model.
// ─────────────────────────────────────────────────────────────────────────────

const HANDLE_POSITIONS = [
  // [name,  top%,  left%,  cursor         ]
  ["nw", 0, 0, "nw-resize"],
  ["n", 0, 50, "n-resize"],
  ["ne", 0, 100, "ne-resize"],
  ["e", 50, 100, "e-resize"],
  ["se", 100, 100, "se-resize"],
  ["s", 100, 50, "s-resize"],
  ["sw", 100, 0, "sw-resize"],
  ["w", 50, 0, "w-resize"],
];

function useImageResizeOverlay(editorWrapperRef, editorRef) {
  // overlay state: { img, rect } | null
  const [overlay, setOverlay] = useState(null);
  const overlayRef = useRef(null);
  const activeImgRef = useRef(null);

  // Recompute overlay position (called on scroll/resize too)
  const refreshOverlay = useCallback(() => {
    const img = activeImgRef.current;
    if (!img || !editorWrapperRef.current) {
      setOverlay(null);
      return;
    }
    const wrapperRect = editorWrapperRef.current.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    setOverlay({
      top: imgRect.top - wrapperRect.top,
      left: imgRect.left - wrapperRect.left,
      width: imgRect.width,
      height: imgRect.height,
      img,
    });
  }, [editorWrapperRef]);

  // Attach click-to-select listener to every <img> inside the editor
  useEffect(() => {
    const wrapper = editorWrapperRef.current;
    if (!wrapper) return;

    function onImgClick(e) {
      const img = e.target;
      if (img.tagName !== "IMG") return;
      // Don't select toolbar icons etc. — only content images
      if (!img.closest(".ck-editor__editable")) return;
      e.stopPropagation();
      activeImgRef.current = img;
      refreshOverlay();
    }

    // Clicking outside an image hides the overlay
    function onDocClick(e) {
      if (overlayRef.current && overlayRef.current.contains(e.target)) return;
      if (
        e.target.tagName === "IMG" &&
        e.target.closest(".ck-editor__editable")
      )
        return;
      activeImgRef.current = null;
      setOverlay(null);
    }

    wrapper.addEventListener("click", onImgClick, true);
    document.addEventListener("click", onDocClick);
    window.addEventListener("resize", refreshOverlay);
    window.addEventListener("scroll", refreshOverlay, true);

    return () => {
      wrapper.removeEventListener("click", onImgClick, true);
      document.removeEventListener("click", onDocClick);
      window.removeEventListener("resize", refreshOverlay);
      window.removeEventListener("scroll", refreshOverlay, true);
    };
  }, [editorWrapperRef, refreshOverlay]);

  // ── DRAG HANDLER ──────────────────────────────────────────────────────────
  function onHandleMouseDown(e, handleName) {
    e.preventDefault();
    e.stopPropagation();

    const img = activeImgRef.current;
    if (!img) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = img.offsetWidth;
    const startH = img.offsetHeight;
    const aspectRatio = startW / startH;

    // The editable area width — used to compute %
    const editable = img.closest(".ck-editor__editable");
    const editorW = editable ? editable.offsetWidth : 800;

    // Size label element
    const label = document.createElement("div");
    label.style.cssText = `
      position:fixed; background:#1e3a8a; color:#fff; font-size:11px;
      padding:2px 7px; border-radius:4px; pointer-events:none; z-index:9999;
      font-family:sans-serif; white-space:nowrap;
    `;
    label.textContent = `${Math.round((startW / editorW) * 100)}%  ${startW}×${startH}px`;
    document.body.appendChild(label);

    function moveLabel(ex, ey) {
      label.style.left = `${ex + 14}px`;
      label.style.top = `${ey + 14}px`;
    }
    moveLabel(e.clientX, e.clientY);

    function onMouseMove(ev) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      let newW = startW;
      let newH = startH;

      // Determine new size based on which handle is dragged
      if (handleName.includes("e")) newW = Math.max(60, startW + dx);
      if (handleName.includes("w")) newW = Math.max(60, startW - dx);
      if (handleName.includes("s")) newH = Math.max(40, startH + dy);
      if (handleName.includes("n")) newH = Math.max(40, startH - dy);

      // Corner handles: maintain aspect ratio
      if (handleName.length === 2 && handleName !== "nw".slice(0, 1)) {
        if (handleName.includes("e") || handleName.includes("w")) {
          newH = newW / aspectRatio;
        } else {
          newW = newH * aspectRatio;
        }
      }

      // Apply live to the DOM img
      img.style.width = `${Math.round(newW)}px`;
      img.style.height = `${Math.round(newH)}px`;

      const pct = Math.min(100, Math.round((newW / editorW) * 100));
      label.textContent = `${pct}%  ${Math.round(newW)}×${Math.round(newH)}px`;
      moveLabel(ev.clientX, ev.clientY);

      // Refresh overlay position live
      refreshOverlay();
    }

    function onMouseUp(ev) {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      label.remove();

      const finalW = img.offsetWidth;
      const finalH = img.offsetHeight;
      const pct = Math.min(100, Math.round((finalW / editorW) * 100));
      const editor = editorRef.current;

      if (!editor) {
        refreshOverlay();
        return;
      }

      // ── The only reliable way to persist resize in ckeditor5-build-classic:
      //    Read current HTML via getData(), patch this image's style in the HTML
      //    string, then write it back via setData(). CKEditor will re-render from
      //    the patched HTML so the new size survives any subsequent re-renders.
      try {
        const currentData = editor.getData();
        const imgSrc = img.getAttribute("src") || "";

        // Parse the editor HTML into a temp document so we can surgically edit it
        const parser = new DOMParser();
        const tempDoc = parser.parseFromString(currentData, "text/html");
        const allImgs = Array.from(tempDoc.querySelectorAll("img"));

        // Match by src (base64 srcs are unique per image)
        let targetImg =
          allImgs.find((i) => i.getAttribute("src") === imgSrc) || null;

        // Fallback: match by index among editor images
        if (!targetImg) {
          const editorImgs = Array.from(
            editorWrapperRef.current?.querySelectorAll(
              ".ck-editor__editable img",
            ) || [],
          );
          const idx = editorImgs.indexOf(img);
          if (idx >= 0 && allImgs[idx]) targetImg = allImgs[idx];
        }

        if (targetImg) {
          // Bake width% as inline style — survives getData()/setData() round-trip
          targetImg.style.width = pct + "%";
          targetImg.style.height = "auto";
          targetImg.setAttribute("width", String(Math.round(finalW)));
          targetImg.setAttribute("height", String(Math.round(finalH)));

          // If CKEditor wrapped the img in a <figure>, resize the figure too
          const figure = targetImg.closest("figure");
          if (figure) figure.style.width = pct + "%";

          // Write patched HTML back — CKEditor re-renders with new dimensions
          editor.setData(tempDoc.body.innerHTML);
        } else {
          // Fallback: inline style only (persists until next CKEditor re-render)
          img.style.width = pct + "%";
          img.style.height = "auto";
        }
      } catch (_) {
        img.style.width = pct + "%";
        img.style.height = "auto";
      }

      // Dismiss overlay cleanly after resize
      activeImgRef.current = null;
      setOverlay(null);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  return { overlay, overlayRef, onHandleMouseDown };
}

// ─────────────────────────────────────────────────────────────────────────────
// RESIZE OVERLAY RENDERER
// ─────────────────────────────────────────────────────────────────────────────
function ImageResizeOverlay({ overlay, overlayRef, onHandleMouseDown }) {
  if (!overlay) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: "absolute",
        top: overlay.top,
        left: overlay.left,
        width: overlay.width,
        height: overlay.height,
        pointerEvents: "none",
        zIndex: 40,
        boxSizing: "border-box",
        border: "2px solid #1e88e5",
      }}
    >
      {/* Dim overlay so selected image is visually obvious */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(30,136,229,0.08)",
          pointerEvents: "none",
        }}
      />

      {/* 8 resize handles */}
      {HANDLE_POSITIONS.map(([name, topPct, leftPct, cursor]) => (
        <div
          key={name}
          onMouseDown={(e) => onHandleMouseDown(e, name)}
          style={{
            position: "absolute",
            top: `${topPct}%`,
            left: `${leftPct}%`,
            transform: "translate(-50%, -50%)",
            width: "12px",
            height: "12px",
            background: "#fff",
            border: "2px solid #1e88e5",
            borderRadius: "2px",
            cursor: cursor,
            pointerEvents: "all",
            zIndex: 41,
            boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
          }}
        />
      ))}

      {/* Size badge — top-left */}
      <div
        style={{
          position: "absolute",
          top: "-22px",
          left: "0",
          background: "#1e3a8a",
          color: "#fff",
          fontSize: "10px",
          padding: "2px 6px",
          borderRadius: "4px",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          fontFamily: "sans-serif",
        }}
      >
        {Math.round(overlay.width)} × {Math.round(overlay.height)} px
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function CKEditorComponent({ value, onChange }) {
  const editorRef = useRef(null);
  const editorWrapperRef = useRef(null);

  const { overlay, overlayRef, onHandleMouseDown } = useImageResizeOverlay(
    editorWrapperRef,
    editorRef,
  );

  return (
    // position:relative so the overlay can be absolutely positioned inside
    <div
      ref={editorWrapperRef}
      className="border border-border rounded-xl overflow-visible"
      style={{ position: "relative" }}
    >
      <CKEditor
        editor={ClassicEditor}
        data={value}
        config={EDITOR_CONFIG}
        onReady={(editor) => {
          editorRef.current = editor;
          // Force min-height on the editable area
          editor.editing.view.change((writer) => {
            writer.setStyle(
              "min-height",
              "200px",
              editor.editing.view.document.getRoot(),
            );
          });
        }}
        onChange={(_event, editor) => {
          onChange(editor.getData());
        }}
      />

      {/* Drag-to-resize overlay — sits on top of the selected image */}
      <ImageResizeOverlay
        overlay={overlay}
        overlayRef={overlayRef}
        onHandleMouseDown={onHandleMouseDown}
      />

      {/* Math / formula panel */}
      <MathPanel editorRef={editorRef} />
    </div>
  );
}
