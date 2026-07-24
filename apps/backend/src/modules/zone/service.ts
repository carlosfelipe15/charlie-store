import { MedusaService } from "@medusajs/framework/utils";
import Province from "./models/province";
import Municipality from "./models/municipality";

class ZoneModuleService extends MedusaService({
  Province,
  Municipality,
}) {}

export default ZoneModuleService;
