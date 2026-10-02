import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { AddAdminFormValues } from "@/schemas";

interface GeneralInfoSectionProps {
  register: UseFormRegister<AddAdminFormValues>;
  errors: FieldErrors<AddAdminFormValues>;
}

export const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({ register, errors }) => {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        General Info
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Full name */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-xs font-semibold text-muted-foreground">
            Full name <span className="text-destructive">*</span>
          </label>
          <Input
            id="name"
            placeholder="Andy Worchen"
            className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs font-medium text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Email with suffix */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-muted-foreground">
            Email <span className="text-destructive">*</span>
          </label>
          <div className="flex rounded-md shadow-xs">
            <Input
              id="email"
              placeholder="andyworchen@gmail"
              className={`rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 ${
                errors.emailPrefix ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
              {...register("emailPrefix")}
            />
            <span className="inline-flex items-center rounded-r-md border border-input bg-muted px-4 text-muted-foreground text-sm font-semibold border-l-0 select-none">
              .com
            </span>
          </div>
          {errors.emailPrefix && (
            <p className="text-xs font-medium text-destructive">{errors.emailPrefix.message}</p>
          )}
        </div>

        {/* Phone number */}
        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-xs font-semibold text-muted-foreground">
            Phone number <span className="text-destructive">*</span>
          </label>
          <Input
            id="phone"
            placeholder="+91 98765 43210"
            className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-xs font-medium text-destructive">{errors.phone.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};
