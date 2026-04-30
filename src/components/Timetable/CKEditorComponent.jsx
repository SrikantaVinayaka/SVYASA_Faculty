import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default function CKEditorComponent({ value, onChange }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        config={{
          height: 200, // optional (not always applied)
        }}
        onReady={(editor) => {
          // ✅ FORCE HEIGHT (IMPORTANT)
          editor.editing.view.change((writer) => {
            writer.setStyle(
              "min-height",
              "200px", // 🔥 CHANGE THIS VALUE (200–300px)
              editor.editing.view.document.getRoot(),
            );
          });
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    </div>
  );
}
