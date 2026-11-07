import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { Input, InputProps } from "./ui/input";

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, disabled, ...props }, ref) => {
		const [showPassword, setShowPassword] = useState(false);

		return (
			<div className="relative">
				<Input
					{...props}
					type={showPassword ? "text" : "password"}
					className={cn("pe-11", className)}
					disabled={disabled}
					ref={ref}
				/>
				<button
					type="button"
					disabled={disabled}
					onPointerDown={(event) => {
						if (
							event.currentTarget.previousElementSibling ===
							document.activeElement
						) {
							event.preventDefault();
						}
					}}
					onClick={() => setShowPassword((visible) => !visible)}
					aria-label={
						showPassword ? "Hide password" : "Show password"
					}
					className="absolute inset-y-0 end-0 flex w-11 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
				>
					{showPassword ? (
						<EyeOff aria-hidden="true" className="size-5" />
					) : (
						<Eye aria-hidden="true" className="size-5" />
					)}
				</button>
			</div>
		);
	},
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
