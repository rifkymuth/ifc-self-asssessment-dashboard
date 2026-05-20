export const K_META = "ifc-ps:metadata";
export const K_RESP = "ifc-ps:responses";
export const K_ESAP = "ifc-ps:esap";

export const DEFAULT_META = {
  projectName: "",
  clientName: "",
  sector: "",
  location: "",
  assessorName: "",
  assessmentDate: new Date().toISOString().slice(0, 10),
  companyProfile: {
    employeeCount: "",
    country: "",
    esmsMaturity: "",
    budgetTier: "",
    certifications: "",
    operatingContext: "",
  },
};
