import { Dialog } from "primereact/dialog";
import { TabView, TabPanel } from "primereact/tabview";
import ActivitPlans from "./activityPlans";
import ActivityPrograms from "./activityPrograms";
import ActivityServices from "./activityServices";
import ActivityPrameters from "./activityParameters";

const ActivityTabsView = ({
  isOpen,
  onClose,
  activityId,
  projectId,
}: {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
  projectId: string;
}) => {
  return (
    <div>
      <Dialog
        header="Activity Details"
        visible={isOpen}
        onHide={onClose}
        className="max-h-[90vh] w-[90vw]"
      >
        <div className="h-full overflow-y-auto">
          <TabView>
            <TabPanel header="Activity Plan">
              <div className="h-[calc(90vh-250px)] overflow-y-auto">
                <ActivitPlans activityId={activityId} projectId={projectId} />
              </div>
            </TabPanel>
            <TabPanel header="Programs">
              <div className="h-[calc(90vh-250px)] overflow-y-auto">
                <ActivityPrograms
                  activityId={activityId}
                  projectId={projectId}
                />
              </div>
            </TabPanel>
            <TabPanel header="Services">
              <div className="h-[calc(90vh-250px)] overflow-y-auto">
                <ActivityServices
                  activityId={activityId}
                  projectId={projectId}
                />
              </div>
            </TabPanel>
            <TabPanel header="Team">
              <div className="h-[calc(90vh-250px)] overflow-y-auto">
                <p>Team members and roles will be displayed here.</p>
              </div>
            </TabPanel>
            <TabPanel header="Parameters">
              <div className="h-[calc(90vh-250px)] overflow-y-auto">
                <ActivityPrameters
                  activityId={activityId}
                  projectId={projectId}
                />
              </div>
            </TabPanel>
          </TabView>
        </div>
      </Dialog>
    </div>
  );
};

export default ActivityTabsView;
