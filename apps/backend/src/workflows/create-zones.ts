import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { createZonesStep, CreateZonesStepInput } from "./steps/create-zones";

/**
 * Bulk-creates provinces + municipalities. Used by `scripts/seed-zones.ts`
 * (and available for a future admin CRUD in Fase D).
 */
export const createZonesWorkflow = createWorkflow(
  "create-zones",
  function (input: CreateZonesStepInput) {
    const result = createZonesStep(input);
    return new WorkflowResponse(result);
  }
);
