import { defineRouteConfig } from "@medusajs/admin-sdk"
import { PencilSquare, TagSolid, Trash } from "@medusajs/icons"
import {
  Button,
  Container,
  FocusModal,
  Heading,
  Input,
  Label,
  createDataTableColumnHelper,
  DataTable,
  toast,
  usePrompt,
  useDataTable,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"
import { useState, useMemo, useEffect } from "react"

type Brand = {
  id: string
  name: string
  products?: { id: string; title: string }[]
}

type BrandsResponse = {
  brands: Brand[]
  count: number
  limit: number
  offset: number
}

const columnHelper = createDataTableColumnHelper<Brand>()

const useColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (brand: Brand) => void
  onDelete: (brand: Brand) => void
}) => {
  return useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
      }),
      columnHelper.accessor("name", {
        header: "Name",
      }),
      columnHelper.accessor("products", {
        header: "Products",
        cell: ({ getValue }) => {
          const products = getValue()
          return products?.length || 0
        },
      }),
      columnHelper.action({
        actions: (ctx) => [
          [
            {
              label: "Edit",
              icon: <PencilSquare />,
              onClick: () => onEdit(ctx.row.original),
            },
          ],
          [
            {
              label: "Delete",
              icon: <Trash />,
              onClick: () => onDelete(ctx.row.original),
            },
          ],
        ],
      }),
    ],
    [onEdit, onDelete]
  )
}

const CreateBrandModal = () => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (name: string) =>
      sdk.client.fetch(`/admin/brands`, {
        method: "POST",
        body: { name },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] })
      toast.success("Marca creada")
      setName("")
      setOpen(false)
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "No se pudo crear la marca"
      )
    },
  })

  const handleSubmit = () => {
    if (!name.trim()) {
      return
    }
    mutateAsync(name.trim())
  }

  return (
    <FocusModal open={open} onOpenChange={setOpen}>
      <FocusModal.Trigger asChild>
        <Button size="small" variant="secondary">
          Create
        </Button>
      </FocusModal.Trigger>
      <FocusModal.Content>
        <FocusModal.Header>
          <Button
            size="small"
            onClick={handleSubmit}
            isLoading={isPending}
            disabled={!name.trim()}
          >
            Save
          </Button>
        </FocusModal.Header>
        <FocusModal.Body className="flex flex-col items-center py-16">
          <div className="flex w-full max-w-lg flex-col gap-y-4">
            <FocusModal.Title asChild>
              <Heading>Create brand</Heading>
            </FocusModal.Title>
            <FocusModal.Description className="sr-only">
              Create a new brand
            </FocusModal.Description>
            <div className="flex flex-col gap-y-2">
              <Label size="small">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nike"
                autoFocus
              />
            </div>
          </div>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}

const EditBrandModal = ({
  brand,
  onClose,
}: {
  brand: Brand | null
  onClose: () => void
}) => {
  const queryClient = useQueryClient()
  const [name, setName] = useState(brand?.name ?? "")

  useEffect(() => {
    setName(brand?.name ?? "")
  }, [brand])

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (name: string) =>
      sdk.client.fetch(`/admin/brands/${brand!.id}`, {
        method: "POST",
        body: { name },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] })
      toast.success("Marca actualizada")
      onClose()
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "No se pudo actualizar la marca"
      )
    },
  })

  const handleSubmit = () => {
    if (!name.trim()) {
      return
    }
    mutateAsync(name.trim())
  }

  return (
    <FocusModal
      open={!!brand}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <FocusModal.Content>
        <FocusModal.Header>
          <Button
            size="small"
            onClick={handleSubmit}
            isLoading={isPending}
            disabled={!name.trim()}
          >
            Save
          </Button>
        </FocusModal.Header>
        <FocusModal.Body className="flex flex-col items-center py-16">
          <div className="flex w-full max-w-lg flex-col gap-y-4">
            <FocusModal.Title asChild>
              <Heading>Edit brand</Heading>
            </FocusModal.Title>
            <FocusModal.Description className="sr-only">
              Edit the brand's name
            </FocusModal.Description>
            <div className="flex flex-col gap-y-2">
              <Label size="small">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}

const BrandsPage = () => {
  const limit = 15
  const [pagination, setPagination] = useState({
    pageSize: limit,
    pageIndex: 0,
  })
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)

  const queryClient = useQueryClient()
  const prompt = usePrompt()

  const offset = useMemo(() => {
    return pagination.pageIndex * limit
  }, [pagination])

  const { data, isLoading } = useQuery<BrandsResponse>({
    queryFn: () =>
      sdk.client.fetch(`/admin/brands`, {
        query: { limit, offset },
      }),
    queryKey: ["brands", limit, offset],
  })

  const { mutateAsync: deleteBrand } = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/brands/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] })
      toast.success("Marca eliminada")
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "No se pudo eliminar la marca"
      )
    },
  })

  const handleDelete = async (brand: Brand) => {
    const productCount = brand.products?.length || 0
    const confirmed = await prompt({
      title: "Delete brand",
      description:
        productCount > 0
          ? `"${brand.name}" is assigned to ${productCount} product(s). Deleting it will unassign it from all of them.`
          : `Are you sure you want to delete "${brand.name}"?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    })
    if (confirmed) {
      await deleteBrand(brand.id)
    }
  }

  const columns = useColumns({
    onEdit: setEditingBrand,
    onDelete: handleDelete,
  })

  const table = useDataTable({
    columns,
    data: data?.brands || [],
    getRowId: (row) => row.id,
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
  })

  return (
    <Container className="divide-y p-0">
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <Heading>Brands</Heading>
          <CreateBrandModal />
        </DataTable.Toolbar>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
      <EditBrandModal brand={editingBrand} onClose={() => setEditingBrand(null)} />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Brands",
  icon: TagSolid,
})

export default BrandsPage