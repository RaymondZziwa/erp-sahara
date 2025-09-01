import { Icon } from "@iconify/react";
import { lazy, Suspense } from "react";

// Static imports
import Skills from "../pages/recruitment/config/skills";
import CommissionStructures from "../pages/recruitment/config/commissionStructure";
import JobBoards from "../pages/recruitment/config/JobBoard";
import CommunicationTemplates from "../pages/recruitment/config/communicationTemplates";
import CommunicationTypes from "../pages/recruitment/config/communicationTypes";
import InvoiceSequences from "../pages/recruitment/config/invoiceSequence";
import CandidateSequences from "../pages/recruitment/config/candidateSequence";
import Candidates from "../pages/recruitment/applications/candidates";
import BillingTerms from "../pages/recruitment/jobManagement/billingTerms";
import Companies from "../pages/recruitment/jobManagement/clients";
import JobOrders from "../pages/recruitment/jobManagement/jobOrders";
import JobDistributions from "../pages/recruitment/jobManagement/jobDistributions";
import ContractTerms from "../pages/recruitment/jobManagement/contractTerms";
import CompanyCommunications from "../pages/recruitment/jobManagement/companyCommunication";
import Applicants from "../pages/recruitment/applications/applicants";
import Interviews from "../pages/recruitment/applications/interviews";
import Offers from "../pages/recruitment/applications/offers";

// Loader fallback component
const Loading = () => <div>Loading...</div>;

const RECRUITMENT_ROUTES = [
  {
    name: "Applications",
    icon: <Icon icon="mdi:account-group" fontSize={24} />,
    path: "",
    items: [
      {
        name: "Candidates",
        icon: <Icon icon="mdi:account-outline" fontSize={20} />,
        path: "/candidates",
        element: (
          <Suspense fallback={<Loading />}>
            <Candidates />
          </Suspense>
        ),
      },
      {
        name: "Applications",
        icon: <Icon icon="mdi:account-arrow-right" fontSize={20} />,
        path: "/applications",
        element: (
          <Suspense fallback={<Loading />}>
            <Applicants />
          </Suspense>
        ),
      },
      {
        name: "Interviews",
        icon: <Icon icon="mdi:calendar-account" fontSize={20} />,
        path: "/interviews",
        element: (
          <Suspense fallback={<Loading />}>
            <Interviews />
          </Suspense>
        ),
      },
      {
        name: "Offers",
        icon: <Icon icon="mdi:handshake" fontSize={20} />,
        path: "/offers",
        element: (
          <Suspense fallback={<Loading />}>
            <Offers />
          </Suspense>
        ),
      },
    ],
  },
  {
    name: "Job Management",
    icon: <Icon icon="mdi:briefcase-account" fontSize={24} />,
    path: "",
    items: [
      {
        name: "Clients/Companies",
        icon: <Icon icon="mdi:office-building" fontSize={20} />,
        path: "/companies",
        element: (
          <Suspense fallback={<Loading />}>
            <Companies />
          </Suspense>
        ),
      },
      {
        name: "Contract Terms",
        icon: <Icon icon="mdi:file-document-edit" fontSize={20} />,
        path: "/contract-terms",
        element: (
          <Suspense fallback={<Loading />}>
            <ContractTerms />
          </Suspense>
        ),
      },
      {
        name: "Billing Terms",
        icon: <Icon icon="mdi:cash-multiple" fontSize={20} />,
        path: "/billing-terms",
        element: (
          <Suspense fallback={<Loading />}>
            <BillingTerms />
          </Suspense>
        ),
      },
      {
        name: "Job Orders",
        icon: <Icon icon="mdi:clipboard-list" fontSize={20} />,
        path: "/job-orders",
        element: (
          <Suspense fallback={<Loading />}>
            <JobOrders />
          </Suspense>
        ),
      },
      {
        name: "Job Distribution",
        icon: <Icon icon="mdi:share-all" fontSize={20} />,
        path: "/job-distributions",
        element: (
          <Suspense fallback={<Loading />}>
            <JobDistributions />
          </Suspense>
        ),
      },
      {
        name: "Company Communication",
        icon: <Icon icon="mdi:email-multiple" fontSize={20} />,
        path: "/company-communications",
        element: (
          <Suspense fallback={<Loading />}>
            <CompanyCommunications />
          </Suspense>
        ),
      },
    ],
  },
  {
    name: "Configurations",
    icon: <Icon icon="mdi:cog" fontSize={24} />,
    path: "",
    items: [
      {
        name: "Skills",
        icon: <Icon icon="mdi:tools" fontSize={20} />,
        path: "/skills",
        element: (
          <Suspense fallback={<Loading />}>
            <Skills />
          </Suspense>
        ),
      },
      {
        name: "Communication Types",
        icon: <Icon icon="mdi:message-settings" fontSize={20} />,
        path: "/communication-types",
        element: (
          <Suspense fallback={<Loading />}>
            <CommunicationTypes />
          </Suspense>
        ),
      },
      {
        name: "Communication Templates",
        icon: <Icon icon="mdi:email-edit" fontSize={20} />,
        path: "/communication-templates",
        element: (
          <Suspense fallback={<Loading />}>
            <CommunicationTemplates />
          </Suspense>
        ),
      },
      {
        name: "Job Boards",
        icon: <Icon icon="mdi:newspaper-variant" fontSize={20} />,
        path: "/job-boards",
        element: (
          <Suspense fallback={<Loading />}>
            <JobBoards />
          </Suspense>
        ),
      },
      {
        name: "Commission Structure",
        icon: <Icon icon="mdi:chart-pie" fontSize={20} />,
        path: "/commission-structures",
        element: (
          <Suspense fallback={<Loading />}>
            <CommissionStructures />
          </Suspense>
        ),
      },
      {
        name: "Invoice Sequence",
        icon: <Icon icon="mdi:format-list-numbered" fontSize={20} />,
        path: "/invoice-sequences",
        element: (
          <Suspense fallback={<Loading />}>
            <InvoiceSequences />
          </Suspense>
        ),
      },
      {
        name: "Candidate Sequence",
        icon: <Icon icon="mdi:format-list-checks" fontSize={20} />,
        path: "/candidate-sequences",
        element: (
          <Suspense fallback={<Loading />}>
            <CandidateSequences />
          </Suspense>
        ),
      },
    ],
  },
];

export default RECRUITMENT_ROUTES;