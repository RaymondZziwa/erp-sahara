import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import "react-quill/dist/quill.snow.css";
import { MOSS_APP_ENDPOINTS } from "../../../api/mossAppEndpoints";
import { createMossAppRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { Editor } from "primereact/editor";

function AddStory({ onSave }: { onSave: () => void }) {
  const [value, setValue] = useState<null | string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [storyTitle, setStoryTitle] = useState("");
  const [storyTags, setStoryTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePreview = () => {
    setShowPreview(true);
  };
  const { token, user } = useAuth();

  const handleClose = () => {
    setShowPreview(false);
  };

  const handleUpload = async () => {
    // Add logic for handling story upload
    setIsSubmitting(true);

    const method = "POST";
    const endpoint = MOSS_APP_ENDPOINTS.STORIES.ADD;

    await createMossAppRequest(
      endpoint,
      token.access_token,
      {
        title: storyTitle,
        story: value,
        user_id: user.id,
      },
      onSave,
      method
    );

    setIsSubmitting(false);
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add Your Story</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          value={storyTitle}
          onChange={(e) => setStoryTitle(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter story title"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Tags (comma separated)
        </label>
        <input
          type="text"
          value={storyTags.join(", ")}
          onChange={(e) =>
            setStoryTags(e.target.value.split(",").map((tag) => tag.trim()))
          }
          className="w-full p-2 border rounded"
          placeholder="Enter story tags"
        />
      </div>

      {/* <ReactQuill
        theme="snow"
        value={value}
        onChange={setValue}
        className="h-64 mb-4"
        placeholder="Write your story here..."
      /> */}

      <div className="card">
        <Editor
          placeholder="Write your story here..."
          value={value ?? ""}
          onTextChange={(e) => setValue(e.htmlValue)}
          style={{ height: "320px" }}
        />
      </div>

      <div className="flex justify-end space-x-2 mt-2">
        <Button
          disabled={isSubmitting}
          label="Preview Story"
          icon="pi pi-eye"
          className="p-button-raised p-button-primary !bg-blue-500"
          onClick={handlePreview}
        />
        <Button
          disabled={isSubmitting}
          loading={isSubmitting}
          label="Upload Story"
          icon="pi pi-upload"
          className="p-button-raised p-button-success"
          onClick={handleUpload}
        />
      </div>

      <Dialog
        header="Story Preview"
        visible={showPreview}
        style={{ width: "50vw" }}
        modal
        onHide={handleClose}
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">
            {storyTitle || "Untitled"}
          </h3>
          <div className="text-sm text-gray-600 mb-4">
            {storyTags.length > 0 ? `Tags: ${storyTags.join(", ")}` : "No tags"}
          </div>
          <div dangerouslySetInnerHTML={{ __html: value ?? "" }} />
        </div>
        <div className="text-right">
          <Button
            className="!bg-red-500"
            label="Close"
            icon="pi pi-times "
            onClick={handleClose}
          />
        </div>
      </Dialog>
    </div>
  );
}

export default AddStory;
