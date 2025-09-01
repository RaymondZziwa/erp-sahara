import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { useState } from "react";
import { mossAppApiRequest } from "../../../utils/api";
import { RootState } from "../../../redux/store";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import useUsers from "../../../hooks/mossApp/useUsers";

export const SpendPointsModal = ({ dialogState, setDialogState }: any) => {
    const [points, setPoints] = useState<number>(0);
    const { refresh } = useUsers();
   const token = useSelector((state: RootState)=> state.userAuth?.token.access_token)
    const handleSubmit = async () => {
      if (!dialogState?.selectedItem) return;
  
      const payload = {
        user_id: dialogState.selectedItem.id,
        points,
      };
  
        try {
        await mossAppApiRequest('/spendpoints',"POST", token, payload)
        toast.success("Points have been spent")
        // close modal
        setDialogState({ ...dialogState, currentAction: null, selectedItem: null });
        } catch (error) {
        toast.error(error?.response?.data?.message)
        console.error("Error spending points:", error);
        } finally {
            refresh()
      }
    };
  
    return (
      <Dialog
        header={`Spend Points for ${dialogState?.selectedItem?.last_name}`}
        visible={dialogState?.currentAction === "spend"}
        style={{ width: "30rem" }}
        modal
        onHide={() =>
          setDialogState({ ...dialogState, currentAction: null, selectedItem: null })
        }
      >
        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium">Available Points ({dialogState?.selectedItem?.points})</label>
          <InputNumber
            value={points}
            onValueChange={(e) => setPoints(e.value ?? 0)}
            min={1}
            max={parseInt(dialogState?.selectedItem?.points)}
            showButtons
            inputClassName="w-full"
          />
          <div className="flex justify-end gap-2">
            <Button
              label="Submit"
              icon="pi pi-check"
              onClick={handleSubmit}
              disabled={points <= 0}
            />
          </div>
        </div>
      </Dialog>
    );
  };
