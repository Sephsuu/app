import { AddButton } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { handleChange } from "@/lib/form-handle";
import { BranchService } from "@/services/BranchService";
import { ProductService } from "@/services/ProductService";
import { SupplyService } from "@/services/RawMaterialService";
import { Branch, branchFields, branchInit } from "@/types/branch";
import { Product, productFields, productInit } from "@/types/products";
import { Supply, supplyFields, supplyInit } from "@/types/supply";
import { SupplyItem } from "@/types/supplyOrder";
import { Plus, X } from "lucide-react";
import Image from "next/image";
import React, { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";

const categories = ["MEAT", "SNOWFROST"];
const units = ["kilograms", "grams", "milligrams", "piece", "oz"]

interface Props {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CreateProduct({ setOpen, setReload }: Props) {
    const [loading, setLoading] = useState(true);
    const [onProcess, setProcess] = useState(false);

    const [product, setProduct] = useState<Product>(productInit);
    const [supplies, setSupplies] = useState<Supply[]>([]);
    const [selectedItems, setSelectedItems] = useState<SupplyItem[]>([]);
    
    useEffect(() => {
        async function fetchData() {
            try {
                const data = await SupplyService.getAllSupplies(0, 1000);
                setSupplies(data);
            } catch (error) { toast.error(`${error}`) }
            finally { setLoading(false) } 
        }
        fetchData();
    }, []);

    const handleSelect = async (code: string) => {
        if (!selectedItems.find((item: SupplyItem) => item.code === code)) {
            const selectedItem = supplies.find(item => item.code === code);
            if (selectedItem) {
            setSelectedItems([
                ...selectedItems,
                { code, name: selectedItem.name, quantity: 1, unitMeasurement: selectedItem.unitMeasurement, unitPrice: selectedItem.unitPrice, category: selectedItem.category }
            ]);
            } else {
                console.warn(`Item with code ${code} not found.`);
            }
        }
    };

    const handleQuantityChange = async (code: string, quantity: number) => {
        setSelectedItems(selectedItems.map((item: SupplyItem) => 
            item.code === code 
                ? { ...item, quantity: quantity || 0 } 
                : item
        ));
    };

    const handleRemove = async (code: string) => {
        setSelectedItems(selectedItems.filter((item: SupplyItem) => item.code !== code));
    };

    async function handleSubmit() {
        try {
            setProcess(true);
            setProduct(prev => ({
                ...prev,
                itemsNeeded: selectedItems
            }))
            for (const field of productFields) {
                if (product[field] === "" || product[field] === undefined || product[field] === 0) {
                    toast.info("Please fill up all fields!");
                    return; 
                }
            }
            if (selectedItems.length <= 0) return toast.info("Please fill up all fields!");
            const updatedData = {
                ...product,
                itemsNeeded: selectedItems
            }
            const data = await ProductService.addProduct(updatedData);
            if (data) toast.success(`Product ${product.name} created successfully.`)
            setOpen(!open);
            setReload(prev => !prev);
        } catch(error) { toast.error(`${error}`) }
        finally { setProcess(false) }
    }

    return(
        <Dialog open onOpenChange={ setOpen }>
            <DialogContent className="overflow-y-auto">
                <DialogTitle className="flex items-center gap-2">  
                    <Image
                        src="/images/kp_logo.png"
                        alt="KP Logo"
                        width={40}
                        height={40}
                    />
                    <div className="font-semibold text-xl">Create Product</div>      
                </DialogTitle>
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1 col-span-2">
                        <div>Product Name</div>
                        <Input    
                            className="w-full border-1 border-gray rounded-md max-md:w-full" 
                            name ="name"  
                            value={product.name}
                            onChange={ e => handleChange(e, setProduct)}
                        />  
                    </div>
                    <div className="flex flex-col gap-1">
                        <div>Category</div>
                        <Input    
                            className="w-full border-1 border-gray rounded-md max-md:w-full" 
                            name ="category"  
                            value={product.category}
                            onChange={ e => handleChange(e, setProduct)}
                        />  
                    </div>
                    <div className="flex flex-col gap-1">
                        <div>Price</div>
                        <div className="flex border-1 border-gray rounded-md max-md:w-full">
                            <input disabled value="₱" className="text-center w-10" />
                            <Input    
                                className="w-full border-0" 
                                type="number"
                                name ="price"  
                                value={product.price}
                                onChange={ e => handleChange(e, setProduct)}
                            /> 
                        </div>  
                    </div>

                    <div className="relative col-span-2 border-1 rounded-md shadow-xs mt-4 p-2 h-50 overflow-y-auto">
                        <Select onValueChange={ handleSelect }>
                            <SelectTrigger 
                                hideIcon={ true }
                                className="absolute top-0 left-0 flex items-center justify-center border-0 w-full"
                            >
                                <Plus strokeWidth={ 2 } className="w-5 h-5 text-dark" />
                                <div className="text-dark">Add the supplies needed</div>
                            </SelectTrigger>
                            <SelectContent>
                                {supplies.map((item) => (
                                    <SelectItem key={item.code} value={item.code!}>{item.code} - {item.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="mt-6">
                            {selectedItems.map((item, index) => (
                                <div className="grid grid-cols-5 border-b-1" key={ index }>
                                    <div className="data-table-td col-span-2">{ item.name }</div>
                                    <div className="data-table-td flex items-center col-span-2">
                                        <X className="w-3 h-3" />
                                        <input 
                                            min="1"
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(item.code!, Number(e.target.value))}
                                            className="text-sm w-15 border-0 pl-2 py-1"
                                        />
                                        <div>{ item.unitMeasurement }</div>
                                    </div>
                                    <button 
                                        onClick={ () => handleRemove(item.code!) }
                                        className="data-table-td underline text-darkred !text-[12px]"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-4">
                    <DialogClose className="text-sm">Close</DialogClose>
                    <AddButton 
                        handleSubmit={ handleSubmit }
                        onProcess={ onProcess }
                        label="Add Product"
                        loadingLabel="Adding Product"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}