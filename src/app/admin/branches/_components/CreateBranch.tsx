import { AddButton, Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { handleChange } from "@/lib/form-handle";
import { cn } from "@/lib/utils";
import { AuthService } from "@/services/AuthService";
import { BranchService } from "@/services/BranchService";
import { Branch, branchFields, branchInit } from "@/types/branch";
import { User, userFields, userInit } from "@/types/user";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const status = ['Open', 'Under Renovation']  

interface Props {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CreateBranch({ setOpen, setReload }: Props) {
    const [loading, setLoading] = useState(true);
    const [onProcess, setProcess] = useState(false);

    const [branch, setBranch] = useState<Branch>(branchInit);
    const [date, setDate] = useState<Date | undefined>();
    const [dateOpen, setDateOpen] = useState(false);

    async function handleSubmit() {
        try{         
            setProcess(true);
            for (const field of branchFields) {
                if (
                    branch[field] === "" ||
                    branch[field] === null ||
                    branch[field] === undefined
                ) {
                    toast.info("Please fill up all fields!");
                return; 
                }
            }

            const data = await BranchService.addBranch(branch);
            if (data) toast.success(`Branch ${branch.branchName} registered successfully!`);    
        }
        catch(error){ toast.error(`${error}`) }
        finally { 
            setReload(prev => !prev);
            setProcess(false);
            setOpen(!open);
        }
    }

    return(
        <Dialog open onOpenChange={ setOpen }>
            <DialogContent className="h-9/10 overflow-y-auto">
                <DialogTitle className="flex items-center gap-2">  
                    <Image
                        src="/images/kp_logo.png"
                        alt="KP Logo"
                        width={40}
                        height={40}
                    />
                    <div className="font-semibold text-xl">Create Branch</div>      
                </DialogTitle>
                <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2 font-semibold">Branch Details</div>
                    <div className="flex flex-col gap-1 col-span-2">
                        <div>Branch Name</div>
                        <div className="flex border-1 border-gray rounded-md max-md:w-full">
                            <input value="Krispy Papi" className="w-24 text-center border-0" readOnly />
                            <Input    
                                className="w-full" 
                                name ="branchName"  
                                value={branch.branchName}
                                onChange={ e => handleChange(e, setBranch)}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                        <div>Branch Status</div>
                        <Select 
                            value={ branch.branchStatus ?? "" }
                            onValueChange={ (value) => setBranch(prev => ({
                                ...prev,
                                branchStatus: value
                            }))}
                        >
                            <SelectTrigger className="w-full border-1 border-gray" name="branchStatus">
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    status.map((item, index) => (
                                        <SelectItem value={ item } key={ index }>{ item }</SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                        <div>Branch Status</div>
                        <RadioGroup
                            className="mt-2 flex"
                            value={String(branch.isInternal)}              
                            name="isInternal"
                            onValueChange={(value) => {
                                setBranch((prev) => ({
                                ...prev,
                                isInternal: value === "true",           
                                }));
                            }}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="true" className="border-1 border-dark" id="r1" />
                                <Label htmlFor="r1">Internal Branch</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="false" className="border-1 border-dark" id="r2" />
                                <Label htmlFor="r2">External False</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="col-span-2 font-semibold mt-2">Location of the Branch</div>
                    <div className="flex flex-col gap-1 col-span-2">
                        <div>Street Address</div>
                        <Input    
                            className="w-full border-1 border-gray max-md:w-full" 
                            name ="streetAddress"  
                            value={branch.streetAddress}
                            onChange={ e => handleChange(e, setBranch)}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div>Barangay</div>
                        <Input    
                            className="w-full border-1 border-gray max-md:w-full" 
                            name ="barangay"  
                            value={branch.barangay}
                            onChange={ e => handleChange(e, setBranch)}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div>Municipality/City</div>
                        <Input    
                            className="w-full border-1 border-gray max-md:w-full" 
                            name ="city"  
                            value={branch.city}
                            onChange={ e => handleChange(e, setBranch)}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div>Province</div>
                        <Input    
                            className="w-full border-1 border-gray max-md:w-full" 
                            name ="province"  
                            value={branch.province}
                            onChange={ e => handleChange(e, setBranch)}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div>Zip Code</div>
                        <Input    
                            className="w-full border-1 border-gray max-md:w-full" 
                            name ="zipCode"  
                            value={branch.zipCode}
                            onChange={ e => handleChange(e, setBranch)}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-4">
                    <DialogClose className="text-sm">Close</DialogClose>
                    <AddButton 
                        handleSubmit={ handleSubmit }
                        onProcess={ onProcess }
                        label="Add Branch"
                        loadingLabel="Adding Branch"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}