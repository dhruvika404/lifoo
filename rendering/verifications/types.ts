export interface VerificationItem {
  id: string;
  name: string;
  owner: string;
  submitted: string;
  documents: string[];
  status: "Pending" | "Approved" | "Rejected" | "Resubmission Requested";
  rejectionReason?: string;
  resubmissionDocs?: string[];
  resubmissionReason?: string;
}
