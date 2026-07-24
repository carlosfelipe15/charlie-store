import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import {
  setProductZonesStep,
  SetProductZonesStepInput,
} from "./steps/set-product-zones";

/**
 * Sets the municipalities a product is available in (reconciling links). Used by
 * `scripts/seed-zones.ts` and, later, by the admin product widget (Fase D).
 */
export const setProductZonesWorkflow = createWorkflow(
  "set-product-zones",
  function (input: SetProductZonesStepInput) {
    const result = setProductZonesStep(input);
    return new WorkflowResponse(result);
  }
);
