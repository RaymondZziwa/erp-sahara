import { Accordion, AccordionTab } from "primereact/accordion";
import { Avatar } from "primereact/avatar";
import { Badge } from "primereact/badge";
import { Story } from "../../../redux/slices/types/mossApp/Story";

export default function StoriesAccordion({ stories }: { stories: Story[] }) {
  return (
    <div className="p-4 rounded-lg shadow-lg bg-white">
      <Accordion activeIndex={0}>
        {stories.map((story) => (
          <AccordionTab
            key={story.id}
            header={
              <div className="flex items-center gap-4 w-full">
                <Avatar
                  image={
                    "https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png"
                  }
                  shape="circle"
                  className="border border-gray-300"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">
                    {`${story.user.first_name} ${story.user.last_name}`}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(story.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Badge
                  value={story.comments_count}
                  severity="info"
                  className="ml-auto bg-blue-100 text-blue-800"
                />
              </div>
            }
          >
            <div className="text-gray-700 mt-2">
              <div dangerouslySetInnerHTML={{ __html: story.story }} />
            </div>
          </AccordionTab>
        ))}
      </Accordion>
    </div>
  );
}
