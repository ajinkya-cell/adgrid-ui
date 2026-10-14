"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../lib/utils";

// One control for checkboxes and radios. A real <input> sits underneath (visually hidden), so
// keyboard, forms and screen readers work natively; every visual state reads the input through
// :has(), so the drawing can never disagree with what the browser thinks is checked.

export type ChoiceType = "checkbox" | "radio";
export type ChoiceSize = "sm" | "md" | "lg";
export type ChoiceVariant = "default" | "card";

// The selected box "pops out" of its well: a light, top-lit surface.
const POPOUT = {
  background: "linear-gradient(180deg, #f5f5f5 0%, #d9d9d9 100%)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.6), 0 4px 10px -2px rgba(0,0,0,0.5)",
};
const PEARL_SHADOW = "inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(0,0,0,0.6)";
const PRISMATIC =
  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 75%, transparent 100%)";

const SIZES = {
  sm: { box: "size-4", pearl: "size-1.5", icon: 10, text: "text-[13px] leading-[18px]", nudge: "mt-px", gap: "gap-2.5" },
  md: { box: "size-[18px]", pearl: "size-2", icon: 12, text: "text-sm leading-5", nudge: "mt-px", gap: "gap-3" },
  lg: { box: "size-5", pearl: "size-2", icon: 13, text: "text-[15px] leading-[22px]", nudge: "mt-px", gap: "gap-3" },
} as const;

const EASE_OUT = "ease-[cubic-bezier(0.32,0.72,0,1)]";

// ─── Group ──────────────────────────────────────────────────────────────────

interface GroupContextValue {
  type: ChoiceType;
  name: string;
  isChecked: (value: string) => boolean;
  toggle: (value: string, checked: boolean) => void;
  disabled?: boolean;
  invalid?: boolean;
  size?: ChoiceSize;
  variant?: ChoiceVariant;
}

const GroupContext = createContext<GroupContextValue | null>(null);

interface ChoiceGroupBaseProps {
  /** Group heading, announced as the group's name. */
  label?: ReactNode;
  description?: ReactNode;
  /** Shared input name. Generated when omitted. */
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
  size?: ChoiceSize;
  variant?: ChoiceVariant;
  orientation?: "vertical" | "horizontal";
  className?: string;
  children: ReactNode;
}

interface RadioGroupProps extends ChoiceGroupBaseProps {
  type?: "radio";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

interface CheckboxGroupProps extends ChoiceGroupBaseProps {
  type: "checkbox";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type ChoiceGroupProps = RadioGroupProps | CheckboxGroupProps;

/** Holds the value for a set of Choices: one string for radios, a list for checkboxes. */
export function ChoiceGroup(props: ChoiceGroupProps) {
  const {
    type = "radio",
    label,
    description,
    name,
    disabled,
    invalid,
    size,
    variant,
    orientation = "vertical",
    className,
    children,
  } = props;
  const isRadio = type === "radio";
  const autoName = useId();
  const labelId = useId();
  const descId = useId();

  const [own, setOwn] = useState<string | string[]>(props.defaultValue ?? (isRadio ? "" : []));
  const current = props.value ?? own;

  const commit = (next: string | string[]) => {
    if (props.value === undefined) setOwn(next);
    (props.onValueChange as ((value: string | string[]) => void) | undefined)?.(next);
  };

  const context: GroupContextValue = {
    type,
    name: name ?? autoName,
    disabled,
    invalid,
    size,
    variant,
    isChecked: (value) => (Array.isArray(current) ? current.includes(value) : current === value),
    toggle: (value, checked) => {
      if (isRadio) {
        if (checked) commit(value);
        return;
      }
      const list = Array.isArray(current) ? current : [];
      commit(checked ? [...list.filter((v) => v !== value), value] : list.filter((v) => v !== value));
    },
  };

  return (
    <div
      role={isRadio ? "radiogroup" : "group"}
      aria-labelledby={label ? labelId : undefined}
      aria-describedby={description ? descId : undefined}
      aria-invalid={isRadio && invalid ? true : undefined}
      aria-disabled={disabled || undefined}
      className={cn("flex flex-col gap-3", className)}
    >
      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <span id={labelId} className="text-sm font-medium tracking-tight text-neutral-100">
              {label}
            </span>
          )}
          {description && (
            <span id={descId} className="text-[13px] leading-relaxed text-neutral-500">
              {description}
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "flex-row flex-wrap gap-x-6 gap-y-3" : "flex-col",
          orientation === "vertical" && (variant === "card" ? "gap-2.5" : "gap-3.5")
        )}
      >
        <GroupContext.Provider value={context}>{children}</GroupContext.Provider>
      </div>
    </div>
  );
}

// ─── Choice ─────────────────────────────────────────────────────────────────

export interface ChoiceProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "checked" | "defaultChecked" | "value"> {
  /** Checkbox or radio. Inside a ChoiceGroup the group decides. */
  type?: ChoiceType;
  label?: ReactNode;
  description?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Checkbox only: a partly-selected parent. Shows a dash instead of the check. */
  indeterminate?: boolean;
  /** Required inside a ChoiceGroup; it's what the group stores. */
  value?: string;
  size?: ChoiceSize;
  /** "card" mounts the choice on a raised panel that lifts when selected. */
  variant?: ChoiceVariant;
  invalid?: boolean;
}

export const Choice = forwardRef<HTMLInputElement, ChoiceProps>(function Choice(
  {
    type: typeProp,
    label,
    description,
    checked: checkedProp,
    defaultChecked,
    onCheckedChange,
    indeterminate = false,
    value,
    size: sizeProp,
    variant: variantProp,
    invalid: invalidProp,
    disabled: disabledProp,
    name,
    id: idProp,
    className,
    onChange,
    ...rest
  },
  ref
) {
  const group = useContext(GroupContext);
  const inGroup = group !== null && value !== undefined;
  const type = (inGroup ? group.type : typeProp) ?? "checkbox";
  const isRadio = type === "radio";
  const size = SIZES[sizeProp ?? group?.size ?? "md"];
  const variant = variantProp ?? group?.variant ?? "default";
  const disabled = disabledProp ?? group?.disabled ?? false;
  const invalid = invalidProp ?? group?.invalid ?? false;
  const isCard = variant === "card";

  const autoId = useId();
  const id = idProp ?? autoId;
  const descId = `${id}-description`;

  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const controlled = inGroup || checkedProp !== undefined;
  const [own, setOwn] = useState(defaultChecked ?? false);
  const checked = inGroup ? group.isChecked(value) : checkedProp ?? own;
  const dash = indeterminate && !isRadio;

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = dash;
  }, [dash]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    const next = event.target.checked;
    if (inGroup) group.toggle(value, next);
    else if (checkedProp === undefined) setOwn(next);
    onCheckedChange?.(next);
  };

  const focusRing =
    "outline-white/40 outline-offset-2 group-has-[:focus-visible]/choice:outline group-has-[:focus-visible]/choice:outline-1";

  return (
    <label
      htmlFor={id}
      data-state={dash ? "indeterminate" : checked ? "checked" : "unchecked"}
      data-disabled={disabled ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      className={cn(
        "group/choice relative flex items-start select-none",
        size.gap,
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
        isCard && [
          "rounded-2xl border border-white/[0.07] p-4",
          "bg-[linear-gradient(180deg,#19191b_0%,#141415_100%)]",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),inset_0_-1px_0_0_rgba(0,0,0,0.5),0_6px_16px_-8px_rgba(0,0,0,0.5)]",
          "transition-[border-color,box-shadow] duration-200",
          !disabled && "hover:border-white/[0.11]",
          "has-[:checked]:border-white/[0.12] has-[:checked]:border-t-white/[0.2]",
          "has-[:checked]:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.1),inset_0_-1px_0_0_rgba(0,0,0,0.6),0_20px_40px_-12px_rgba(0,0,0,0.7),0_2px_8px_-2px_rgba(0,0,0,0.5)]",
          "outline-white/40 outline-offset-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-1",
          // An error belongs to the whole group, so it tints chosen cards too.
          invalid &&
            "border-[rgb(229_115_115/0.35)] has-[:checked]:border-[rgb(229_115_115/0.35)] has-[:checked]:border-t-[rgb(229_115_115/0.5)]",
        ],
        className
      )}
    >
      <input
        {...rest}
        ref={inputRef}
        id={id}
        type={type}
        name={name ?? group?.name}
        value={value}
        disabled={disabled}
        checked={controlled ? checked : undefined}
        defaultChecked={controlled ? undefined : defaultChecked}
        onChange={handleChange}
        aria-invalid={invalid || undefined}
        aria-describedby={description ? descId : undefined}
        className="peer sr-only"
      />

      {/* The well. Unchecked, it's a socket cut into the surface. */}
      <span
        aria-hidden="true"
        className={cn(
          "relative grid shrink-0 place-items-center border border-white/[0.1] bg-[#070707]",
          "shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.07)]",
          "transition-[border-color,scale] duration-150",
          !disabled && "group-hover/choice:border-white/[0.15] group-active/choice:scale-[0.94]",
          isRadio ? "rounded-full group-has-[:checked]/choice:border-white/[0.16]" : "rounded-[6px]",
          invalid && "border-[rgb(229_115_115/0.45)]",
          !isCard && focusRing,
          size.box,
          size.nudge
        )}
      >
        {isRadio ? (
          // A pearl rises in the middle of the well.
          <span
            className={cn(
              // Half a pixel down: the well's top shadow and bottom rim make true center read high.
              "rounded-full translate-y-[0.5px] opacity-0 scale-[0.4] transition-[opacity,scale] duration-200",
              "ease-[cubic-bezier(0.34,1.36,0.64,1)] motion-reduce:transition-opacity",
              "group-has-[:checked]/choice:scale-100 group-has-[:checked]/choice:opacity-100",
              size.pearl
            )}
            style={{ background: POPOUT.background, boxShadow: PEARL_SHADOW }}
          />
        ) : (
          <>
            {/* The whole box rises out of the well. */}
            <span
              className={cn(
                "absolute -inset-px rounded-[6px] border border-white/40 opacity-0 scale-[0.7]",
                "transition-[opacity,scale] duration-200 motion-reduce:transition-opacity",
                EASE_OUT,
                "group-has-[:checked]/choice:scale-100 group-has-[:checked]/choice:opacity-100",
                dash && "scale-100 opacity-100"
              )}
              style={POPOUT}
            />
            {dash ? (
              <span className="relative h-[1.75px] w-[45%] rounded-full bg-neutral-950" />
            ) : (
              <svg
                viewBox="0 0 12 12"
                width={size.icon}
                height={size.icon}
                fill="none"
                className="relative"
              >
                <path
                  d="M2.6 6.3 4.9 8.6 9.4 3.6"
                  pathLength={1}
                  stroke="#0a0a0a"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn(
                    "[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-200 motion-reduce:transition-none",
                    EASE_OUT,
                    "group-has-[:checked]/choice:delay-75 group-has-[:checked]/choice:[stroke-dashoffset:0]"
                  )}
                />
              </svg>
            )}
          </>
        )}
      </span>

      {(label || description) && (
        <span className="flex min-w-0 flex-col gap-0.5">
          {label && (
            <span
              className={cn(
                "font-medium tracking-tight text-neutral-300 transition-colors duration-150",
                "group-hover/choice:text-neutral-100 group-has-[:checked]/choice:text-neutral-100",
                size.text
              )}
            >
              {label}
            </span>
          )}
          {description && (
            <span id={descId} className="text-[13px] leading-relaxed text-neutral-500">
              {description}
            </span>
          )}
        </span>
      )}

      {/* Card only: the prismatic edge catches the light once the card is chosen. */}
      {isCard && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-3 top-0 h-[1.5px] opacity-0 transition-opacity duration-200 group-has-[:checked]/choice:opacity-100"
          style={{ background: PRISMATIC }}
        />
      )}
    </label>
  );
});
