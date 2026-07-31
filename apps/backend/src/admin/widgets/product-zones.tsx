import { sdk } from "../lib/sdk";
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import {
    Button,
    Checkbox,
    Container,
    FocusModal,
    Heading,
    Text,
    toast,
} from "@medusajs/ui"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"

type Municipality = { id: string; name: string; code: string }
type Province = { id: string; name: string; code: string; municipalities: Municipality[] }

/**
 * Assigns a product to one or more delivery municipalities (Fase D of the
 * zones feature — see .context/plans/2026-07-19/plan-zonas-entrega-provincia-municipio.md).
 * Reconciled via the existing `setProductZonesWorkflow`
 * (apps/backend/src/workflows/set-product-zones.ts), previously only
 * invoked from `scripts/seed-zones.ts`. Empty selection = available
 * everywhere (permissive fallback, same as the storefront's catalog filter).
 */
const ProductZonesWidget = ({
    data: product,
}: DetailWidgetProps<AdminProduct>) => {
    const queryClient = useQueryClient()
    const [open, setOpen] = useState(false)
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [isSaving, setIsSaving] = useState(false)

    const { data: assignment, isLoading: isLoadingAssignment } = useQuery<{
        municipality_ids: string[]
    }>({
        queryFn: () =>
            sdk.client.fetch(`/admin/products/${product.id}/zones`),
        queryKey: ["product-zones", product.id],
    })

    const { data: zonesResult, isLoading: isLoadingZones } = useQuery<{
        provinces: Province[]
    }>({
        queryFn: () => sdk.client.fetch(`/admin/zones`),
        queryKey: ["admin-zones"],
        enabled: open,
    })

    const currentIds = assignment?.municipality_ids ?? []

    // Re-seed the modal's local selection from the current assignment every
    // time it opens (not on every render — the admin might have unsaved
    // in-progress checkbox changes while it's open).
    useEffect(() => {
        if (open) {
            setSelected(new Set(currentIds))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    const provinces = zonesResult?.provinces ?? []

    const summary = useMemo(() => {
        if (isLoadingAssignment) {
            return "Cargando…"
        }
        return currentIds.length === 0
            ? "Disponible en toda Cuba"
            : `Disponible en ${currentIds.length} municipio${currentIds.length === 1 ? "" : "s"}`
    }, [isLoadingAssignment, currentIds])

    const toggleMunicipality = (id: string, checked: boolean) => {
        setSelected((prev) => {
            const next = new Set(prev)
            if (checked) {
                next.add(id)
            } else {
                next.delete(id)
            }
            return next
        })
    }

    const toggleProvince = (province: Province, checked: boolean) => {
        setSelected((prev) => {
            const next = new Set(prev)
            for (const m of province.municipalities) {
                if (checked) {
                    next.add(m.id)
                } else {
                    next.delete(m.id)
                }
            }
            return next
        })
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await sdk.client.fetch(`/admin/products/${product.id}/zones`, {
                method: "POST",
                body: { municipality_ids: Array.from(selected) },
            })
            await queryClient.invalidateQueries({
                queryKey: ["product-zones", product.id],
            })
            toast.success("Zonas de entrega actualizadas")
            setOpen(false)
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "No se pudieron actualizar las zonas de entrega"
            )
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <Heading level="h2">Zonas de entrega</Heading>
                <Button
                    size="small"
                    variant="secondary"
                    onClick={() => setOpen(true)}
                >
                    Editar
                </Button>
            </div>
            <div className="px-6 py-4">
                <Text size="small" className="text-ui-fg-subtle">
                    {summary}
                </Text>
            </div>

            <FocusModal open={open} onOpenChange={setOpen}>
                <FocusModal.Content>
                    <FocusModal.Header>
                        <Button
                            size="small"
                            onClick={handleSave}
                            isLoading={isSaving}
                            disabled={isLoadingZones}
                        >
                            Guardar
                        </Button>
                    </FocusModal.Header>
                    <FocusModal.Body className="flex flex-col items-center overflow-y-auto py-16">
                        <div className="flex w-full max-w-2xl flex-col gap-y-6">
                            <div>
                                <FocusModal.Title asChild>
                                    <Heading>Zonas de entrega</Heading>
                                </FocusModal.Title>
                                <FocusModal.Description>
                                    Elegí los municipios donde este producto está
                                    disponible. Vacío = disponible en toda Cuba.
                                </FocusModal.Description>
                            </div>

                            {isLoadingZones ? (
                                <Text size="small">Cargando zonas…</Text>
                            ) : (
                                <div className="flex flex-col gap-y-4">
                                    {provinces.map((province) => {
                                        const allSelected = province.municipalities.every(
                                            (m) => selected.has(m.id)
                                        )
                                        const someSelected = province.municipalities.some(
                                            (m) => selected.has(m.id)
                                        )
                                        return (
                                            <div
                                                key={province.id}
                                                className="border-ui-border-base rounded-lg border p-4"
                                            >
                                                <div className="mb-3 flex items-center gap-x-2">
                                                    <Checkbox
                                                        id={`province-${province.id}`}
                                                        checked={
                                                            allSelected
                                                                ? true
                                                                : someSelected
                                                                  ? "indeterminate"
                                                                  : false
                                                        }
                                                        onCheckedChange={(checked) =>
                                                            toggleProvince(province, !!checked)
                                                        }
                                                    />
                                                    <label
                                                        htmlFor={`province-${province.id}`}
                                                        className="txt-compact-medium-plus cursor-pointer"
                                                    >
                                                        {province.name}
                                                    </label>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 pl-6 sm:grid-cols-3">
                                                    {province.municipalities.map((m) => (
                                                        <div
                                                            key={m.id}
                                                            className="flex items-center gap-x-2"
                                                        >
                                                            <Checkbox
                                                                id={`municipality-${m.id}`}
                                                                checked={selected.has(m.id)}
                                                                onCheckedChange={(checked) =>
                                                                    toggleMunicipality(m.id, !!checked)
                                                                }
                                                            />
                                                            <label
                                                                htmlFor={`municipality-${m.id}`}
                                                                className="txt-compact-small cursor-pointer"
                                                            >
                                                                {m.name}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </FocusModal.Body>
                </FocusModal.Content>
            </FocusModal>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "product.details.after",
})

export default ProductZonesWidget
