# LiFoo Admin Project Rules

## Form Implementation and Validation
- **Library Choice:** Always use **React Hook Form** combined with **Zod** (via `@hookform/resolvers/zod`) for managing forms, input states, and validations.
- **Avoid Manual State:** Do not use plain `useState` hook variables for input values or manual form error objects.
- **Custom Components:** For custom select/dropdown controls that don't support native `{...register("name")}`, use programmatically set values with React Hook Form's `setValue("fieldName", value, { shouldValidate: true })`.
