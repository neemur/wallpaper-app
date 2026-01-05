// --- src/components/WallInputCard.tsx ---
import React, { useState, useCallback } from "react";
import { Wall } from "../lib/types";
import {
  BOLT_LENGTH_OPTIONS,
  PAPER_WIDTH_OPTIONS,
  PATTERN_MATCH_OPTIONS,
  PRICING_OPTIONS,
  REMOVAL_RATE_OPTIONS,
  // SR_MULTIPLIER_OPTIONS, // Removed
  COMPARABLE_BOLT_LENGTH_OPTIONS, // Added
} from "../lib/constants";
import { fieldDependencies } from "../lib/calculations";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { Card, CardContent } from "./ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/Select";
import { ChevronDown, ChevronUp, InfoIcon, Plus, Trash2 } from "./ui/Icons";

interface WallInputCardProps {
  wall: Wall;
  onChange: (wallId: string, updates: Partial<Wall>) => void;
  onDelete: (wallId: string) => void;
  onToggleCollapse: (wallId: string) => void;
}

export const WallInputCard: React.FC<WallInputCardProps> = ({
  wall,
  onChange,
  onDelete,
  onToggleCollapse,
}) => {
  const { id, name, isCollapsed } = wall;
  const [highlightedInputs, setHighlightedInputs] = useState<string[]>([]);
  const [highlightedOutputs, setHighlightedOutputs] = useState<string[]>([]);
  const [isRemovalCollapsed, setIsRemovalCollapsed] = useState(false); // Local state for removal section collapse

  const handleNumberInputWheel = (
    event: React.WheelEvent<HTMLInputElement>
  ) => {
    if (document.activeElement === event.currentTarget) {
      event.preventDefault();
    }
  };

  const handleMouseEnterField = (fieldKey: keyof Wall | string) => {
    const related = fieldDependencies[fieldKey as string];
    if (related) {
      setHighlightedInputs([...related.inputs]);
      setHighlightedOutputs([...related.outputs]);
    } else {
      setHighlightedInputs([fieldKey as string]);
      setHighlightedOutputs([]);
    }
  };

  const handleMouseLeaveField = () => {
    setHighlightedInputs([]);
    setHighlightedOutputs([]);
  };

  const handleInputChange = useCallback(
    (field: keyof Wall, value: any) => {
      // Updated for new fields
      const numericFields: (keyof Wall)[] = [
        // 'heightOfWall', // No longer a direct input
        "paperWidthCustom",
        "lengthOfBoltCustom",
        "patternVerticalRepeat",
        "unitPriceOfWallpaper",
        "comparableLengthOfBoltCustom",
        "shippingAndTariffs", // Added per request point #1
        "piaSurcharge",
      ];
      let processedValue = value;
      if (numericFields.includes(field)) {
        processedValue = value === "" ? undefined : Number(value);
      }
      onChange(id, { [field]: processedValue });
    },
    [id, onChange]
  );

  // --- New handlers for dynamic wall widths (PDF Point #5) ---
  const handleIndividualWidthChange = (index: number, value: string) => {
    const newValue = value === "" ? undefined : Number(value);
    const newWidths = [...(wall.individualWidths || [])];
    newWidths[index] = newValue;

    const sum = newWidths.reduce((acc: number, val) => acc + (val || 0), 0);
    onChange(id, {
      individualWidths: newWidths,
      width: sum > 0 ? sum : undefined,
    });
  };

  const handleAddWidth = () => {
    const newWidths = [...(wall.individualWidths || []), undefined];
    onChange(id, { individualWidths: newWidths });
  };

  const handleRemoveWidth = (index: number) => {
    const newWidths = (wall.individualWidths || []).filter(
      (_, i) => i !== index
    );
    const sum = newWidths.reduce((acc: number, val) => acc + (val || 0), 0);
    onChange(id, {
      individualWidths: newWidths,
      width: sum > 0 ? sum : undefined,
    });
  };
  // --- End of new handlers ---

  // --- Wallpaper Removal Handlers ---
  const calculateRemovalTotals = (
    dimensions: { width?: number; height?: number }[],
    rateOption: number | "custom" | undefined,
    rateCustom: number | undefined
  ) => {
    let totalSqFt = 0;
    dimensions.forEach((dim) => {
      if (dim.width && dim.height) {
        totalSqFt += (dim.width * dim.height) / 144;
      }
    });

    let rate = 0;
    if (rateOption === "custom") {
      rate = rateCustom || 0;
    } else if (typeof rateOption === "number") {
      rate = rateOption;
    }

    const totalCost = totalSqFt * rate;
    return { totalSqFt, totalCost };
  };

  const handleAddRemovalDimension = () => {
    const newDims = [
      ...(wall.removalDimensions || []),
      { width: undefined, height: undefined },
    ];
    const { totalSqFt, totalCost } = calculateRemovalTotals(
      newDims,
      wall.removalSqFtRateOption,
      wall.removalSqFtRateCustom
    );
    onChange(id, {
      removalDimensions: newDims,
      removalTotalSqFt: totalSqFt,
      removalTotalCost: totalCost,
    });
  };

  const handleRemoveRemovalDimension = (index: number) => {
    const newDims = (wall.removalDimensions || []).filter(
      (_, i) => i !== index
    );
    const { totalSqFt, totalCost } = calculateRemovalTotals(
      newDims,
      wall.removalSqFtRateOption,
      wall.removalSqFtRateCustom
    );
    onChange(id, {
      removalDimensions: newDims,
      removalTotalSqFt: totalSqFt,
      removalTotalCost: totalCost,
    });
  };

  const handleRemovalDimensionChange = (
    index: number,
    field: "width" | "height",
    value: string
  ) => {
    const numValue = value === "" ? undefined : Number(value);
    const newDims = [...(wall.removalDimensions || [])];
    newDims[index] = { ...newDims[index], [field]: numValue };

    const { totalSqFt, totalCost } = calculateRemovalTotals(
      newDims,
      wall.removalSqFtRateOption,
      wall.removalSqFtRateCustom
    );
    onChange(id, {
      removalDimensions: newDims,
      removalTotalSqFt: totalSqFt,
      removalTotalCost: totalCost,
    });
  };

  const handleRemovalRateChange = (value: string) => {
    // value comes from Select as string
    const newOption = value === "custom" ? "custom" : Number(value);
    const { totalSqFt, totalCost } = calculateRemovalTotals(
      wall.removalDimensions || [],
      newOption,
      wall.removalSqFtRateCustom
    );

    const updates: Partial<Wall> = {
      removalSqFtRateOption: newOption,
      removalTotalSqFt: totalSqFt,
      removalTotalCost: totalCost,
    };
    if (newOption !== "custom") {
      updates.removalSqFtRateCustom = undefined;
    }
    onChange(id, updates);
  };

  const handleRemovalRateCustomChange = (value: string) => {
    const numValue = value === "" ? undefined : Number(value);
    const { totalSqFt, totalCost } = calculateRemovalTotals(
      wall.removalDimensions || [],
      wall.removalSqFtRateOption,
      numValue
    );
    onChange(id, {
      removalSqFtRateCustom: numValue,
      removalTotalSqFt: totalSqFt,
      removalTotalCost: totalCost,
    });
  };
  // --- End Wallpaper Removal Handlers ---

  const getFieldHighlightClass = (fieldKey: keyof Wall | string) => {
    if (highlightedInputs.includes(fieldKey as string)) {
      return "field-highlight-input"; // Field is an input for the highlighted relationship
    } else if (highlightedOutputs.includes(fieldKey as string)) {
      return "field-highlight-output"; // Field is an output for the highlighted relationship
    }
    return "";
  };

  const getLabelHighlightClass = (fieldKey: keyof Wall | string) => {
    if (
      highlightedInputs.includes(fieldKey as string) &&
      highlightedOutputs.includes(fieldKey as string)
    ) {
      return "label-highlight-input-output";
    } else if (highlightedInputs.includes(fieldKey as string)) {
      return "label-highlight-input";
    } else if (highlightedOutputs.includes(fieldKey as string)) {
      return "label-highlight-output";
    }
    return "";
  };

  const renderReadOnlyInput = (
    label: string,
    fieldKey: keyof Wall,
    value?: number | string,
    unitOrClass?: string,
    baseTooltipText?: string
  ) => {
    const isBoldGreen = unitOrClass === "font-bold-lg-green";
    const isBoldBlue = unitOrClass === "font-bold-lg-blue"; // For paper total
    const unit = isBoldGreen || isBoldBlue ? undefined : unitOrClass;
    let extraClass = "";
    if (isBoldGreen) extraClass = unitOrClass;
    if (isBoldBlue) extraClass = unitOrClass;

    let dynamicTooltip = baseTooltipText || label;
    if (baseTooltipText) {
      if (fieldKey === "numberOfCutsForProject") {
        dynamicTooltip = `(⌈Perimeter (${wall.width || "N/A"}) / Paper Width (${
          (wall.paperWidthOption === "custom"
            ? wall.paperWidthCustom
            : wall.paperWidthOption) || "N/A"
        })⌉) + 1`;
      } else if (fieldKey === "totalLengthNeeded") {
        dynamicTooltip = `Length of Cuts (${
          wall.lengthOfCuts?.toFixed(2) || "N/A"
        }) × # Cuts (${wall.numberOfCutsForProject || "N/A"})`;
      } else if (fieldKey === "totalLengthPurchased") {
        dynamicTooltip = `# Bolts (${
          wall.numberOfBolts || "N/A"
        }) × Bolt Length (${
          (wall.lengthOfBoltOption === "custom"
            ? wall.lengthOfBoltCustom
            : wall.lengthOfBoltOption) || "N/A"
        })`;
      } else if (fieldKey === "equivalentProjectSRCalculation") {
        dynamicTooltip = `⌈(Calc. Total Length (${
          wall.totalLengthNeeded?.toFixed(2) || "N/A"
        }) / Comp. Bolt Length (${
          (wall.comparableLengthOfBolt === "custom"
            ? wall.comparableLengthOfBoltCustom
            : wall.comparableLengthOfBolt) || "N/A"
        })) × 2⌉`;
      } else if (fieldKey === "width") {
        dynamicTooltip = "Sum of all individual wall widths";
      } else if (fieldKey === "heightOfWall") {
        dynamicTooltip =
          "IF Chair Rail Ht > 0: Ceiling Ht - Crown Ht - Chair Rail Ht. ELSE: Ceiling Ht - Crown Ht - Baseboard Ht.";
      } else if (fieldKey === "salesPricePlusSalesTax") {
        dynamicTooltip = `(Material Cost [${
          wall.materialCost?.toFixed(2) || "N/A"
        }] * 1.2) * 1.06`;
      } else if (fieldKey === "paperGrandTotal") {
        dynamicTooltip = `Sales Price Plus Tax [${
          wall.salesPricePlusSalesTax?.toFixed(2) || "N/A"
        }] + Shipping [${wall.shippingAndTariffs?.toFixed(2) || "N/A"}]`;
      }
    }

    return (
      <div
        onMouseEnter={() => handleMouseEnterField(fieldKey)}
        onMouseLeave={handleMouseLeaveField}
        className={getFieldHighlightClass(fieldKey)}
      >
        <div className="info-icon-container">
          <Label
            htmlFor={`${id}-${fieldKey}`}
            className={getLabelHighlightClass(fieldKey)}
          >
            {label}
          </Label>
          {baseTooltipText && (
            <span
              className="info-icon"
              tabIndex={0}
              role="button"
              aria-label={`Info for ${label}`}
            >
              <InfoIcon />
              <span className="tooltip-text">{dynamicTooltip}</span>
            </span>
          )}
        </div>
        <Input
          id={`${id}-${fieldKey}`}
          type="text"
          value={
            value !== undefined && value !== null
              ? unit
                ? `${value} ${unit}`
                : String(value)
              : ""
          }
          className={`input-readonly ${extraClass}`}
          readOnly
          tabIndex={-1}
        />
      </div>
    );
  };

  const renderInput = (
    label: string,
    fieldKey: keyof Wall,
    type: string = "number",
    placeholder?: string,
    options?: { label: string; value: string | number }[]
  ) => {
    return (
      <div
        onMouseEnter={() => handleMouseEnterField(fieldKey)}
        onMouseLeave={handleMouseLeaveField}
        className={getFieldHighlightClass(fieldKey)}
      >
        <Label
          htmlFor={`${id}-${fieldKey}`}
          className={getLabelHighlightClass(fieldKey)}
        >
          {label}
        </Label>
        {options ? (
          <Select
            id={`${id}-${fieldKey}`}
            onValueChange={(val) =>
              handleInputChange(
                fieldKey,
                val === "custom" ? "custom" : Number(val)
              )
            }
            value={(wall as any)[fieldKey]}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={`${id}-${fieldKey}`}
            type={type}
            value={(wall as any)[fieldKey] || ""}
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
            onWheel={type === "number" ? handleNumberInputWheel : undefined}
            className="mt-1"
            placeholder={placeholder}
          />
        )}
      </div>
    );
  };

  return (
    <Card className="card-mb-6">
      <div className="card-header-wall" onClick={() => onToggleCollapse(id)}>
        <div
          className="flex items-center flex-grow-0 min-w-0"
          style={{
            display: "flex",
            alignItems: "center",
            flexGrow: 0,
            minWidth: 0,
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            baseClass="btn"
            style={{ height: "2rem", width: "2rem", marginRight: "0.5rem" }}
          >
            {" "}
            {isCollapsed ? <ChevronDown /> : <ChevronUp />}{" "}
          </Button>
          {/* Updated per PDF point #2 */}
          <Input
            id={`wallName-${id}`}
            value={wall.name || ""}
            onChange={(e) => {
              e.stopPropagation();
              handleInputChange("name", e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            className="input-wall-name"
            placeholder="Space Name"
          />
        </div>
        <div
          className="flex items-center flex-shrink-0"
          style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
        >
          {/* Updated to show paper total */}
          {isCollapsed &&
            wall.paperGrandTotal !== undefined &&
            wall.paperGrandTotal > 0 && (
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginRight: "0.75rem",
                  color: "#059669",
                }}
              >
                Paper: ${wall.paperGrandTotal.toFixed(2)}
              </span>
            )}
          {isCollapsed && wall.grandTotalLabor !== undefined && (
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                marginRight: "0.75rem",
                color: wall.grandTotalLabor < 0 ? "#ef4444" : "#16a34a",
              }}
            >
              {/* Updated per PDF point #13 */}
              Space Labor: ${wall.grandTotalLabor.toFixed(2)}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            baseClass="btn"
            style={{
              height: "2rem",
              width: "2rem",
              borderRadius: "9999px",
              padding: "0.25rem",
            }}
            aria-label={`Delete ${name}`}
          >
            <Trash2 style={{ height: "1rem", width: "1rem" }} />
          </Button>
        </div>
      </div>
            {!isCollapsed && (
              <>
                {/* --- Wallpaper Removal Subsection (Part a) --- */}
                {/* Moved OUT of CardContent to ensure it is always full width and separate from the input grid */}
                <div
                  className="card-base overflow-hidden border-orange-200 shadow-sm"
                  style={{ margin: "1rem" }}
                >
                  <div
                    className="card-header-wall bg-orange-50/80 hover:bg-orange-100/80 transition-colors border-b border-orange-100 flex flex-row items-center gap-2"
                    style={{ justifyContent: "flex-start" }}
                    onClick={() => setIsRemovalCollapsed(!isRemovalCollapsed)}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      baseClass="btn"
                      className="h-8 w-8 text-orange-900 flex-shrink-0"
                    >
                      {isRemovalCollapsed ? <ChevronDown /> : <ChevronUp />}
                    </Button>
                    <h4 className="text-lg font-medium text-orange-900 select-none">
                      Wallpaper Removal
                    </h4>
                    {wall.removalTotalCost ? (
                      <span className="ml-2 text-sm font-semibold text-orange-700">
                        (${wall.removalTotalCost.toFixed(2)})
                      </span>
                    ) : null}
                  </div>
      
                  {!isRemovalCollapsed && (
                    <div
                      className="p-5 flex flex-row gap-6 items-start"
                      style={{ paddingLeft: "30px" }}
                    >
                      {/* Left Side: Removal Areas (Grow) */}
                      <div className="flex-grow space-y-3 min-w-0">
                        <Label className="text-orange-900 text-xs uppercase font-bold tracking-wider">
                          Removal Areas (W x H)
                        </Label>
                        <div className="space-y-2">
                          {(wall.removalDimensions || []).map((dim, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                flexWrap: "nowrap",
                              }}
                            >
                              <Input
                                type="number"
                                placeholder="W"
                                value={dim.width || ""}
                                onChange={(e) =>
                                  handleRemovalDimensionChange(
                                    index,
                                    "width",
                                    e.target.value
                                  )
                                }
                                onWheel={handleNumberInputWheel}
                                className="bg-white h-9 text-sm"
                                style={{ width: "80px", flex: "0 0 80px" }}
                              />
                              <span className="text-gray-400 text-sm flex-shrink-0">
                                x
                              </span>
                              <Input
                                type="number"
                                placeholder="H"
                                value={dim.height || ""}
                                onChange={(e) =>
                                  handleRemovalDimensionChange(
                                    index,
                                    "height",
                                    e.target.value
                                  )
                                }
                                onWheel={handleNumberInputWheel}
                                className="bg-white h-9 text-sm"
                                style={{ width: "80px", flex: "0 0 80px" }}
                              />
                              <span className="text-gray-400 text-sm flex-shrink-0">
                                in
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveRemovalDimension(index)}
                                baseClass="btn"
                                aria-label="Remove dimension"
                                style={{
                                  color: "#ef4444",
                                  height: "2.25rem",
                                  width: "2.25rem",
                                }}
                                className="flex-shrink-0"
                              >
                                <Trash2 style={{ width: "1rem", height: "1rem" }} />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button
                          onClick={handleAddRemovalDimension}
                          variant="ghost"
                          size="sm"
                          className="bg-white border border-orange-200 text-orange-900 hover:bg-orange-50 mt-2 text-xs"
                          baseClass="btn"
                        >
                          <Plus
                            className="mr-1"
                            style={{ height: "0.75rem", width: "0.75rem" }}
                          />{" "}
                          Add Area
                        </Button>
                      </div>
      
                      {/* Right Side: Rate & Totals (Fixed Width) */}
                      <div className="w-64 flex-shrink-0 space-y-4 bg-orange-50/50 p-4 rounded-lg border border-orange-100">
                        <div>
                          <Label
                            htmlFor={`${id}-removalRate`}
                            className="text-orange-900 text-xs uppercase font-bold tracking-wider mb-2 block"
                          >
                            Sq Ft Rate
                          </Label>
                          <div style={{ width: "160px" }}>
                            <Select
                              id={`${id}-removalRate`}
                              value={String(wall.removalSqFtRateOption || "")}
                              onValueChange={handleRemovalRateChange}
                            >
                              <SelectTrigger className="bg-white border-orange-200 h-9 text-sm w-full">
                                <SelectValue placeholder="Select Rate" />
                              </SelectTrigger>
                              <SelectContent>
                                {REMOVAL_RATE_OPTIONS.map((opt) => (
                                  <SelectItem
                                    key={opt.value}
                                    value={String(opt.value)}
                                  >
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {wall.removalSqFtRateOption === "custom" && (
                              <Input
                                type="number"
                                value={wall.removalSqFtRateCustom || ""}
                                onChange={(e) =>
                                  handleRemovalRateCustomChange(e.target.value)
                                }
                                onWheel={handleNumberInputWheel}
                                className="bg-white border-orange-200 mt-2 h-9 text-sm w-full"
                                placeholder="Custom $/sf"
                              />
                            )}
                          </div>
                        </div>
      
                        <div className="pt-4 border-t border-orange-200">
                          <div>
                            <div className="text-xs text-orange-600 mb-1">
                              Total Sq Ft
                            </div>
                            <div className="font-mono text-lg font-medium text-orange-900">
                              {wall.removalTotalSqFt?.toFixed(2) || "0.00"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
      
                <CardContent className="card-content-grid-wall">
            {/* Changed from Input to ReadOnly per request point #2 */}
            {renderReadOnlyInput(
              "Net Ht of Wall to Paper (in)",
              "heightOfWall",
              wall.heightOfWall?.toFixed(2),
              undefined,
              "IF Chair Rail Ht > 0: Ceiling Ht - Crown Ht - Chair Rail Ht. ELSE: Ceiling Ht - Crown Ht - Baseboard Ht."
            )}

            {/* --- Dynamic Width Inputs (PDF Point #5) --- */}
            <div
              className={`md:col-span-1 ${getFieldHighlightClass(
                "individualWidths"
              )}`}
              onMouseEnter={() => handleMouseEnterField("individualWidths")}
              onMouseLeave={handleMouseLeaveField}
            >
              <Label className={getLabelHighlightClass("individualWidths")}>
                Individual Wall Widths (in)
              </Label>
              <div className="space-y-2 mt-1">
                {(wall.individualWidths || []).map((width, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder={`Width ${index + 1}`}
                      value={width || ""}
                      onChange={(e) =>
                        handleIndividualWidthChange(index, e.target.value)
                      }
                      onWheel={handleNumberInputWheel}
                    />
                    {(wall.individualWidths || []).length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveWidth(index)}
                        baseClass="btn"
                        aria-label="Remove width"
                        style={{ color: "#ef4444", flexShrink: 0 }}
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                onClick={handleAddWidth}
                variant="default"
                size="sm"
                className="mt-2"
                baseClass="btn"
              >
                <Plus
                  className="mr-2"
                  style={{ height: "1rem", width: "1rem" }}
                />{" "}
                Add Width
              </Button>
            </div>

            {renderReadOnlyInput(
              "Total Perimeter of All Walls (in)",
              "width",
              wall.width,
              undefined,
              "Sum of all individual wall widths"
            )}
            {/* --- End of Dynamic Width Inputs --- */}

            <div>
              <div
                onMouseEnter={() => handleMouseEnterField("paperWidthOption")}
                onMouseLeave={handleMouseLeaveField}
                className={getFieldHighlightClass("paperWidthOption")}
              >
                <Label
                  htmlFor={`${id}-paperWidthOption`}
                  className={getLabelHighlightClass("paperWidthOption")}
                >
                  Paper Width
                </Label>
                <Select
                  id={`${id}-paperWidthOption`}
                  onValueChange={(value) => {
                    handleInputChange(
                      "paperWidthOption",
                      value === "custom" ? "custom" : Number(value)
                    );
                    if (value !== "custom")
                      handleInputChange("paperWidthCustom", undefined);
                  }}
                  value={wall.paperWidthOption}
                >
                  {" "}
                  <SelectTrigger>
                    <SelectValue placeholder="Select width" />
                  </SelectTrigger>{" "}
                  <SelectContent>
                    {" "}
                    {PAPER_WIDTH_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={String(option.value)}
                      >
                        {option.label}
                      </SelectItem>
                    ))}{" "}
                  </SelectContent>{" "}
                </Select>
              </div>
              {wall.paperWidthOption === "custom" && (
                <div
                  className={`mt-2 ${getFieldHighlightClass(
                    "paperWidthCustom"
                  )}`}
                  onMouseEnter={() => handleMouseEnterField("paperWidthCustom")}
                  onMouseLeave={handleMouseLeaveField}
                >
                  <Label
                    htmlFor={`${id}-paperWidthCustom`}
                    className={`label-xs ${getLabelHighlightClass(
                      "paperWidthCustom"
                    )}`}
                  >
                    Custom Width (in)
                  </Label>
                  <Input
                    id={`${id}-paperWidthCustom`}
                    type="number"
                    value={wall.paperWidthCustom || ""}
                    onChange={(e) =>
                      handleInputChange("paperWidthCustom", e.target.value)
                    }
                    onWheel={handleNumberInputWheel}
                    className="mt-1"
                  />
                </div>
              )}
            </div>
            <div>
              <div
                onMouseEnter={() => handleMouseEnterField("lengthOfBoltOption")}
                onMouseLeave={handleMouseLeaveField}
                className={getFieldHighlightClass("lengthOfBoltOption")}
              >
                <Label
                  htmlFor={`${id}-lengthOfBoltOption`}
                  className={getLabelHighlightClass("lengthOfBoltOption")}
                >
                  Length of Packaged Bolt
                </Label>
                <Select
                  id={`${id}-lengthOfBoltOption`}
                  onValueChange={(value) => {
                    handleInputChange(
                      "lengthOfBoltOption",
                      value === "custom" ? "custom" : Number(value)
                    );
                    if (value !== "custom")
                      handleInputChange("lengthOfBoltCustom", undefined);
                  }}
                  value={wall.lengthOfBoltOption}
                >
                  {" "}
                  <SelectTrigger>
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>{" "}
                  <SelectContent>
                    {" "}
                    {BOLT_LENGTH_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={String(option.value)}
                      >
                        {option.label}
                      </SelectItem>
                    ))}{" "}
                  </SelectContent>{" "}
                </Select>
              </div>
              {wall.lengthOfBoltOption === "custom" && (
                <div
                  className={`mt-2 ${getFieldHighlightClass(
                    "lengthOfBoltCustom"
                  )}`}
                  onMouseEnter={() =>
                    handleMouseEnterField("lengthOfBoltCustom")
                  }
                  onMouseLeave={handleMouseLeaveField}
                >
                  <Label
                    htmlFor={`${id}-lengthOfBoltCustom`}
                    className={`label-xs ${getLabelHighlightClass(
                      "lengthOfBoltCustom"
                    )}`}
                  >
                    Custom Length (in)
                  </Label>
                  <Input
                    id={`${id}-lengthOfBoltCustom`}
                    type="number"
                    value={wall.lengthOfBoltCustom || ""}
                    onChange={(e) =>
                      handleInputChange("lengthOfBoltCustom", e.target.value)
                    }
                    onWheel={handleNumberInputWheel}
                    className="mt-1"
                  />
                </div>
              )}
            </div>
            {renderInput(
              "Pattern Vertical Repeat (in)",
              "patternVerticalRepeat",
              "number",
              "0 if no repeat"
            )}
            {renderInput(
              "Pattern Match",
              "patternMatch",
              "select",
              undefined,
              PATTERN_MATCH_OPTIONS
            )}
            {/* Added per PDF point #7 */}
            <div>
              <div
                onMouseEnter={() =>
                  handleMouseEnterField("comparableLengthOfBolt")
                }
                onMouseLeave={handleMouseLeaveField}
                className={getFieldHighlightClass("comparableLengthOfBolt")}
              >
                <Label
                  htmlFor={`${id}-comparableLengthOfBolt`}
                  className={getLabelHighlightClass("comparableLengthOfBolt")}
                >
                  Comparable Length of Bolt Multiplier
                </Label>
                <Select
                  id={`${id}-comparableLengthOfBolt`}
                  onValueChange={(value) => {
                    handleInputChange(
                      "comparableLengthOfBolt",
                      value === "custom" ? "custom" : Number(value)
                    );
                    if (value !== "custom")
                      handleInputChange(
                        "comparableLengthOfBoltCustom",
                        undefined
                      );
                  }}
                  value={wall.comparableLengthOfBolt}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select comparable length" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPARABLE_BOLT_LENGTH_OPTIONS.map((option) => (
                      <SelectItem
                        key={String(option.value)}
                        value={String(option.value)}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {wall.comparableLengthOfBolt === "custom" && (
                <div
                  className={`mt-2 ${getFieldHighlightClass(
                    "comparableLengthOfBoltCustom"
                  )}`}
                  onMouseEnter={() =>
                    handleMouseEnterField("comparableLengthOfBoltCustom")
                  }
                  onMouseLeave={handleMouseLeaveField}
                >
                  <Label
                    htmlFor={`${id}-comparableLengthOfBoltCustom`}
                    className={`label-xs ${getLabelHighlightClass(
                      "comparableLengthOfBoltCustom"
                    )}`}
                  >
                    Custom Comparable Length (in)
                  </Label>
                  <Input
                    id={`${id}-comparableLengthOfBoltCustom`}
                    type="number"
                    value={wall.comparableLengthOfBoltCustom || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "comparableLengthOfBoltCustom",
                        e.target.value
                      )
                    }
                    onWheel={handleNumberInputWheel}
                    className="mt-1"
                  />
                </div>
              )}
            </div>
            {renderInput(
              "Installation Priced By",
              "pricedBy",
              "select",
              undefined,
              PRICING_OPTIONS
            )}
            {renderInput(
              "Unit Price of Wallpaper ($ per Bolt)",
              "unitPriceOfWallpaper",
              "number",
              "e.g., 75"
            )}

            {/* Added per request point #1 */}
            {renderInput(
              "Shipping & Tariffs ($)",
              "shippingAndTariffs",
              "number",
              "e.g., 50"
            )}

            {renderReadOnlyInput(
              "Vert. Height of Matched Repeat (in)",
              "verticalHeightOfMatchedRepeat",
              wall.verticalHeightOfMatchedRepeat,
              undefined,
              `Pattern Vert. Repeat (${
                wall.patternVerticalRepeat || "N/A"
              }) × Pattern Match (${wall.patternMatch || "N/A"})`
            )}
            {renderReadOnlyInput(
              "# of Cuts for Project",
              "numberOfCutsForProject",
              wall.numberOfCutsForProject,
              undefined,
              `(⌈Perimeter (${wall.width || "N/A"}) / Paper Width (${
                (wall.paperWidthOption === "custom"
                  ? wall.paperWidthCustom
                  : wall.paperWidthOption) || "N/A"
              })⌉) + 1`
            )}
            {renderReadOnlyInput(
              "# of Repeats per Cut",
              "numberOfRepeatsPerCut",
              wall.numberOfRepeatsPerCut,
              undefined,
              `⌈(Net Height (${
                wall.heightOfWall?.toFixed(2) || "N/A"
              }) + 4″) / Vert. Height of Matched Repeat (${
                wall.verticalHeightOfMatchedRepeat?.toFixed(2) || "N/A"
              })⌉`
            )}
            {renderReadOnlyInput(
              "Length of Cuts (incl. trim) (in)",
              "lengthOfCuts",
              wall.lengthOfCuts?.toFixed(2),
              undefined,
              `# Repeats per Cut (${
                wall.numberOfRepeatsPerCut || "N/A"
              }) × Vert. Height of Matched Repeat (${
                wall.verticalHeightOfMatchedRepeat?.toFixed(2) || "N/A"
              })`
            )}
            {renderReadOnlyInput(
              "Calculated Total Length Needed (in)",
              "totalLengthNeeded",
              wall.totalLengthNeeded?.toFixed(2),
              undefined,
              `Length of Cuts (${
                wall.lengthOfCuts?.toFixed(2) || "N/A"
              }) × # of Cuts (${wall.numberOfCutsForProject || "N/A"})`
            )}
            {renderReadOnlyInput(
              "# of Cut Lengths per Bolt",
              "numberOfCutLengthsPerBolt",
              wall.numberOfCutLengthsPerBolt,
              undefined,
              `⌊Bolt Length (${
                (wall.lengthOfBoltOption === "custom"
                  ? wall.lengthOfBoltCustom
                  : wall.lengthOfBoltOption) || "N/A"
              }) / Length of Cuts (${wall.lengthOfCuts?.toFixed(2) || "N/A"})⌋`
            )}
            {renderReadOnlyInput(
              "# of Bolts to Order",
              "numberOfBolts",
              wall.numberOfBolts,
              undefined,
              `⌈# of Cuts (${
                wall.numberOfCutsForProject || "N/A"
              }) / # Cut Lengths per Bolt (${
                wall.numberOfCutLengthsPerBolt || "N/A"
              })⌉`
            )}
            {renderReadOnlyInput(
              "Total Material from Bolts (in)",
              "totalLengthPurchased",
              wall.totalLengthPurchased?.toFixed(2),
              undefined,
              `# Bolts (${wall.numberOfBolts || "N/A"}) × Bolt Length (${
                (wall.lengthOfBoltOption === "custom"
                  ? wall.lengthOfBoltCustom
                  : wall.lengthOfBoltOption) || "N/A"
              })`
            )}
            {renderReadOnlyInput(
              "# of Yards to Order",
              "numberOfYardsToOrder",
              wall.numberOfYardsToOrder,
              undefined,
              `⌈Total Material from Bolts (${
                wall.totalLengthPurchased?.toFixed(2) || "N/A"
              }) / 36⌉`
            )}
            {renderReadOnlyInput(
              "Equiv. Project S/R Calc.",
              "equivalentProjectSRCalculation",
              wall.equivalentProjectSRCalculation,
              undefined,
              `⌈(Calc. Total Length (${
                wall.totalLengthNeeded?.toFixed(2) || "N/A"
              }) / Comp. Bolt Length (${
                (wall.comparableLengthOfBolt === "custom"
                  ? wall.comparableLengthOfBoltCustom
                  : wall.comparableLengthOfBolt) || "N/A"
              })) × 2⌉`
            )}

            {/* Labor Totals */}
            {renderReadOnlyInput(
              "Base Labor ($)",
              "baseLabor",
              wall.baseLabor?.toFixed(2),
              undefined,
              `Equiv. S/R Calc. (${
                wall.equivalentProjectSRCalculation || "N/A"
              }) × Price/SR (or 38% of Material Cost)`
            )}
            {renderReadOnlyInput(
              "Height Surcharge ($)",
              "heightSurcharge",
              wall.heightSurcharge?.toFixed(2),
              undefined,
              `(Round((Ceiling Ht. or Wall Ht. - 96″) / 12)) × $100`
            )}
            {renderReadOnlyInput(
              "Ceiling Surcharge ($)",
              "ceilingSurcharge",
              wall.ceilingSurcharge?.toFixed(2),
              undefined,
                          `If Ceiling, equals Base Labor (${
                            wall.baseLabor?.toFixed(2) || "N/A"
                          })`
                        )}            {renderInput(
              "PIA Surcharge ($)",
              "piaSurcharge",
              "number",
              "e.g., 25"
            )}
            {renderReadOnlyInput(
              "Space Grand Total ($)",
              "grandTotalLabor",
              wall.grandTotalLabor?.toFixed(2),
              "font-bold-lg-green",
              "Base Labor + Height Surcharge + Ceiling Surcharge + PIA Surcharge"
            )}

            {/* Added per request point #1 - Paper Totals */}
            {/*<div className="md:col-span-1"></div> /!* Spacer *!/*/}
            {/*materialCost: { inputs: ['unitPriceOfWallpaper', 'numberOfBolts'], outputs: ['baseLabor', 'salesPricePlusSalesTax', 'paperGrandTotal'] },*/}

            {renderReadOnlyInput(
              "Material Cost ($)",
              "materialCost",
              wall.materialCost?.toFixed(2),
              "font-bold-lg-green",
              "unitPriceOfWallpaper * numberOfBolts"
            )}

            {renderReadOnlyInput(
              "Sales Price Plus Sales Tax ($)",
              "salesPricePlusSalesTax",
              wall.salesPricePlusSalesTax?.toFixed(2),
              undefined,
              `(Material Cost [${
                wall.materialCost?.toFixed(2) || "N/A"
              }] * 1.2) * 1.06`
            )}
            {renderReadOnlyInput(
              "Paper Grand Total ($)",
              "paperGrandTotal",
              wall.paperGrandTotal?.toFixed(2),
              "font-bold-lg-blue",
              `Sales Price Plus Tax [${
                wall.salesPricePlusSalesTax?.toFixed(2) || "N/A"
              }] + Shipping [${wall.shippingAndTariffs?.toFixed(2) || "N/A"}]`
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
};
