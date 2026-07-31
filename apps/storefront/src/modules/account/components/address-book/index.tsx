import React from "react"

import AddAddress from "../address-card/add-address"
import EditAddress from "../address-card/edit-address-modal"
import { HttpTypes } from "@medusajs/types"
import type { ZoneProvince } from "@lib/data/zones"

type AddressBookProps = {
  customer: HttpTypes.StoreCustomer
  zones: ZoneProvince[]
}

const AddressBook: React.FC<AddressBookProps> = ({ customer, zones }) => {
  const { addresses } = customer
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 mt-4">
        {addresses.map((address) => {
          return (
            <EditAddress zones={zones} address={address} key={address.id} />
          )
        })}
        <AddAddress zones={zones} addresses={addresses} />
      </div>
    </div>
  )
}

export default AddressBook
