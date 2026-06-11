import {Skeleton} from "@heroui/react";

interface FormSkeletonProps {
    row: number
    col?: number
}

export const FormSkeleton = (props :FormSkeletonProps ) => {
    const {row, col = 1} = props
    const form_fields = Array.from({length: row}, (_, i) => i).map((index) => (
        <FormFieldSkeleton key={index} />
    ))
    
    const form_cols = Array.from({length: col}, (_, i) => i).map((index) => (
        <div key={index} className="flex flex-col items-start w-full">
            {form_fields}
        </div>
    ))
    
    return(
        <div className="flex flex-row gap-8 w-full">
            {form_cols}
        </div>
    )
}

const FormFieldSkeleton = () => {
    return (
        <div className="shadow-panel space-y-3 rounded-lg bg-transparent p-4 w-full">
            <Skeleton animationType="pulse" className="h-4 w-2/5 rounded-lg" />
            <Skeleton animationType="pulse" className="h-8 rounded-lg" />
        </div>
    )
} 