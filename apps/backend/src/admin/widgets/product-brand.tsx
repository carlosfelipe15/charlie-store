import { sdk } from "../lib/sdk";
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { Button, Container, Heading, Select, toast } from "@medusajs/ui"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"

type AdminProductBrand = AdminProduct & {
    brand?: {
        id: string;
        name: string;
    } | null
}

type Brand = {
    id: string
    name: string
}

const NONE_VALUE = "__none__"

const ProductBrandWidget = ({
    data: product,
}: DetailWidgetProps<AdminProduct>) => {
    const queryClient = useQueryClient()

    const { data: queryResult, isLoading } = useQuery({
        queryFn: () =>
            sdk.admin.product.retrieve(product.id, {
                fields: "+brand.*",
            }),
        queryKey: ["product", product.id, "brand"],
    })

    const { data: brandsResult, isLoading: isLoadingBrands } = useQuery<{
        brands: Brand[]
    }>({
        queryFn: () => sdk.client.fetch(`/admin/brands`, { query: { limit: 1000 } }),
        queryKey: ["brands", "all"],
    })

    const currentBrandId =
        (queryResult?.product as AdminProductBrand)?.brand?.id ?? NONE_VALUE

    const [selectedBrandId, setSelectedBrandId] = useState(currentBrandId)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        setSelectedBrandId(currentBrandId)
    }, [currentBrandId])

    const hasChanges = selectedBrandId !== currentBrandId

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await sdk.client.fetch(`/admin/products/${product.id}`, {
                method: "POST",
                body: {
                    additional_data: {
                        brand_id:
                            selectedBrandId === NONE_VALUE ? null : selectedBrandId,
                    },
                },
            })
            await queryClient.invalidateQueries({
                queryKey: ["product", product.id, "brand"],
            })
            toast.success("Marca actualizada")
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "No se pudo actualizar la marca"
            )
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <Heading level="h2">Brand</Heading>
            </div>
            <div className="flex items-center justify-between gap-x-4 px-6 py-4">
                <Select
                    value={selectedBrandId}
                    onValueChange={setSelectedBrandId}
                    disabled={isLoading || isLoadingBrands}
                >
                    <Select.Trigger>
                        <Select.Value placeholder="Sin marca" />
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Item value={NONE_VALUE}>Sin marca</Select.Item>
                        {brandsResult?.brands.map((brand) => (
                            <Select.Item key={brand.id} value={brand.id}>
                                {brand.name}
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select>
                <Button
                    size="small"
                    variant="secondary"
                    disabled={!hasChanges || isSaving}
                    isLoading={isSaving}
                    onClick={handleSave}
                >
                    Guardar
                </Button>
            </div>
        </Container>
    )
}
export const config = defineWidgetConfig({
    zone: "product.details.before",
})
export default ProductBrandWidget
