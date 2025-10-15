import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Icon } from "@iconify/react";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";
import { SALES_ENDPOINTS } from "../../../api/salesEndpoints";
import { DeliveryNote } from "../../../redux/slices/types/sales/deliveryNotes";

interface GRNPreviewProps {
  deliveryNote: DeliveryNote;
  visible: boolean;
  onClose: () => void;
}

interface GRNDetails {
  grn_number: string;
  grn_date: string;
  grn_remarks: string;
  grn_attachment_url: string;
  grn_attachment_name: string;
  created_at: string;
}

const GRNPreview: React.FC<GRNPreviewProps> = ({
  deliveryNote,
  visible,
  onClose,
}) => {
  const { token } = useAuth();
  const [grnDetails, setGrnDetails] = useState<GRNDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (visible && deliveryNote.grn_note) {
      fetchGRNDetails();
    }
  }, [visible, deliveryNote]);

  const fetchGRNDetails = async () => {
    setIsLoading(true);
    try {
      // Assuming you have an endpoint to get GRN details
      const response = await axios.get(
        SALES_ENDPOINTS.DELIVERY_NOTES.GET_GRN(deliveryNote.id),
        {
          headers: {
            'Authorization': `Bearer ${token.access_token}`,
          },
        }
      );
      setGrnDetails(response.data);
    } catch (error) {
      console.error("Error fetching GRN details:", error);
      // If no specific endpoint, create mock data from existing note
      setGrnDetails({
        grn_number: deliveryNote.grn_note?.grn_number || "N/A",
        grn_date: deliveryNote.grn_note?.grn_date || "N/A",
        grn_remarks: deliveryNote.grn_note?.grn_remarks || "No remarks",
        grn_attachment_url: deliveryNote.grn_note?.attachment_url || "",
        grn_attachment_name: deliveryNote.grn_note?.attachment_name || "GRN Document",
        created_at: deliveryNote.grn_note?.created_at || "N/A",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!grnDetails?.grn_attachment_url) return;

    try {
      const response = await axios.get(grnDetails.grn_attachment_url, {
        headers: {
          'Authorization': `Bearer ${token.access_token}`,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', grnDetails.grn_attachment_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading GRN:", error);
    }
  };

  const handlePreview = async () => {
    if (!grnDetails?.grn_attachment_url) return;

    try {
      const response = await axios.get(grnDetails.grn_attachment_url, {
        headers: {
          'Authorization': `Bearer ${token.access_token}`,
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error) {
      console.error("Error previewing GRN:", error);
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'solar:document-bold-duotone';
      case 'doc':
      case 'docx':
        return 'solar:document-text-bold-duotone';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'solar:gallery-bold-duotone';
      default:
        return 'solar:document-bold-duotone';
    }
  };

  const getFileType = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'PDF Document';
      case 'doc':
      case 'docx':
        return 'Word Document';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'Image File';
      default:
        return 'Document';
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Close"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text"
      />
    </div>
  );

  if (previewUrl) {
    return (
      <Dialog
        header={`GRN Preview - ${grnDetails?.grn_number}`}
        visible={visible}
        style={{ width: "90vw", height: "90vh" }}
        onHide={() => {
          closePreview();
          onClose();
        }}
        modal
        className="preview-dialog"
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{grnDetails?.grn_attachment_name}</h3>
            <div className="flex gap-2">
              <Button
                label="Download"
                icon="pi pi-download"
                onClick={handleDownload}
                className="p-button-outlined"
              />
              <Button
                label="Close Preview"
                icon="pi pi-times"
                onClick={closePreview}
                className="p-button-text"
              />
            </div>
          </div>
          <div className="flex-1 border rounded-lg">
            <iframe
              src={previewUrl}
              className="w-full h-full"
              title="GRN Document Preview"
            />
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      header={`GRN Details - ${deliveryNote.delivery_number}`}
      visible={visible}
      style={{ width: "600px" }}
      footer={footer}
      onHide={onClose}
      modal
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading GRN details...</span>
        </div>
      ) : grnDetails ? (
        <div className="space-y-4">
          {/* GRN Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">GRN Number</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border">
                {grnDetails.grn_number}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">GRN Date</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border">
                {new Date(grnDetails.grn_date).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="text-sm font-medium text-gray-700">Remarks</label>
            <div className="mt-1 p-3 bg-gray-50 rounded border min-h-20">
              {grnDetails.grn_remarks || "No remarks provided"}
            </div>
          </div>

          {/* Attachment */}
          <div>
            <label className="text-sm font-medium text-gray-700">Attachment</label>
            <div className="mt-1 border rounded-lg p-4 bg-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon 
                    icon={getFileIcon(grnDetails.grn_attachment_name)} 
                    className="text-blue-500 mr-3" 
                    fontSize={24} 
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {grnDetails.grn_attachment_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getFileType(grnDetails.grn_attachment_name)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    icon="pi pi-eye"
                    className="p-button-outlined p-button-sm"
                    onClick={handlePreview}
                    tooltip="Preview Document"
                    tooltipOptions={{ position: 'top' }}
                  />
                  <Button
                    icon="pi pi-download"
                    className="p-button-outlined p-button-sm"
                    onClick={handleDownload}
                    tooltip="Download Document"
                    tooltipOptions={{ position: 'top' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Created Date */}
          <div className="text-xs text-gray-500 text-center">
            Created on {new Date(grnDetails.created_at).toLocaleString()}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Icon icon="solar:document-bold-duotone" className="text-gray-400 text-4xl mb-2" />
          <p className="text-gray-500">No GRN details available</p>
        </div>
      )}
    </Dialog>
  );
};

export default GRNPreview;