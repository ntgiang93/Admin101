import type {EPermission} from "@/types/base/Permission.ts";
import React from "react";
import {Checkbox} from "@heroui/react";
import type {SelectOptionType} from "@/types/base/SelectOption.ts";

interface Props {
    moduleKey: string;
    permission: SelectOptionType;
    checked: boolean;
    onChange: (moduleKey: string, permission: EPermission, check: boolean) => void
}

const PermissionCheckbox = React.memo(
    ({
         moduleKey,
         permission,
         checked,
         onChange,
     }: Props) => {
        const permissionValue = permission.value as EPermission;
        const checkboxId = `${moduleKey}-${permissionValue}`;

        return (
            <Checkbox
                id={checkboxId}
                aria-label={checkboxId}
                variant="secondary"
                isSelected={checked}
                onChange={(value) =>
                    onChange(moduleKey, permissionValue, value)
                }
            >
                <Checkbox.Content className="flex flex-row items-center gap-1">
                    <Checkbox.Control>
                        <Checkbox.Indicator />
                    </Checkbox.Control>
                    <span>{permission.label}</span>
                </Checkbox.Content>
            </Checkbox>
        );
    }
);

export default PermissionCheckbox;