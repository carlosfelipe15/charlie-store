import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ZONE_MODULE } from "../../modules/zone";
import ZoneModuleService from "../../modules/zone/service";

export type CreateZonesStepInput = {
  provinces: {
    name: string;
    code: string;
    iso_code?: string;
    municipalities: { name: string; code: string }[];
  }[];
};

/**
 * Creates provinces and their municipalities. Done in two steps (province first,
 * then its municipalities with `province_id`) rather than a nested create — the
 * nested-create behavior of a DML `hasMany` isn't relied upon here (this is the
 * repo's first intra-module relation; keeping it explicit avoids a surprise).
 */
export const createZonesStep = createStep(
  "create-zones-step",
  async (input: CreateZonesStepInput, { container }) => {
    const zoneService: ZoneModuleService = container.resolve(ZONE_MODULE);

    const createdProvinceIds: string[] = [];
    const createdMunicipalityIds: string[] = [];

    for (const p of input.provinces) {
      const province = await zoneService.createProvinces({
        name: p.name,
        code: p.code,
        iso_code: p.iso_code,
      });
      createdProvinceIds.push(province.id);

      if (p.municipalities.length) {
        const created = await zoneService.createMunicipalities(
          p.municipalities.map((m) => ({
            name: m.name,
            code: m.code,
            province_id: province.id,
          }))
        );
        const list = Array.isArray(created) ? created : [created];
        createdMunicipalityIds.push(...list.map((m) => m.id));
      }
    }

    return new StepResponse(
      { provinceIds: createdProvinceIds, municipalityIds: createdMunicipalityIds },
      { provinceIds: createdProvinceIds, municipalityIds: createdMunicipalityIds }
    );
  },
  async (undo, { container }) => {
    if (!undo) {
      return;
    }
    const zoneService: ZoneModuleService = container.resolve(ZONE_MODULE);
    if (undo.municipalityIds.length) {
      await zoneService.deleteMunicipalities(undo.municipalityIds);
    }
    if (undo.provinceIds.length) {
      await zoneService.deleteProvinces(undo.provinceIds);
    }
  }
);
