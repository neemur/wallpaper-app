// --- src/lib/types.ts ---

export interface ClientInfo {
    clientName: string;
    clientAddress: string;
    clientPhone: string;
    clientEmail: string;
}

export interface GeneralProjectInfo {
    designerBuilderName: string;
    projectManagerName: string;
    projectManagerPhone: string;
    invoiceTo: string;
    notes: string;
    projectType: string;
    roundTripMileage?: number;
    numberOfDaysForInstall?: number;
    inputDate: string;
    estimateSentDate: string;
    approvalDate: string;
    orderDate: string;
    orderReceivedDate: string;
    estimatedDateReadyForInstall: string;
    scheduledInstallDate: string;
}

export interface RoomSpecificInfo {
    paperManufacturer: string;
    paperPatternNumber: string;
    paperColorNumber: string;
    paperProductPhotoLink: string;
    paperType: string;
    paperSpecialRequirements: string;
    ceilingHeight?: number;
    baseboardHeight?: number;
    verticalCrownHeight?: number;
    chairRailHeight?: number;
    isDetailsCollapsed?: boolean;
    isCeiling?: boolean; // Added per PDF point #3
}

export interface RemovalDimension {
    width?: number;
    height?: number;
}

export interface Wall {
    id: string;
    name: string;
    width?: number; // This will now store the SUM of individualWidths
    individualWidths?: (number | undefined)[]; // Added per PDF point #5
    heightOfWall?: number; // Now calculated from RoomSpecificInfo
    paperWidthOption: number | 'custom';
    paperWidthCustom?: number;
    lengthOfBoltOption: number | 'custom';
    lengthOfBoltCustom?: number;
    patternVerticalRepeat?: number;
    patternMatch: number;
    verticalHeightOfMatchedRepeat?: number;
    pricedBy: number | 'materialPercent';
    unitPriceOfWallpaper?: number;
    comparableLengthOfBolt?: number | 'custom'; // Added per PDF point #7
    comparableLengthOfBoltCustom?: number; // Added per PDF point #7
    numberOfCutsForProject?: number;
    numberOfRepeatsPerCut?: number;
    lengthOfCuts?: number;
    totalLengthNeeded?: number; // Calculated Total Length Needed
    totalLengthPurchased?: number; // New field: Length of Bolt * # of Bolts
    numberOfCutLengthsPerBolt?: number;
    numberOfBolts?: number;
    numberOfYardsToOrder?: number;
    materialCost?: number;
    equivalentProjectSRCalculation?: number;
    baseLabor?: number;
    heightSurcharge?: number;
    ceilingSurcharge?: number; // Added per PDF point #11
    subtotalLabor?: number; // Renamed from grandTotalLabor for wall-specific total
    travelCharges?: number; // Will always be 0 from this function
    grandTotalLabor?: number; // Kept for consistency, but represents wall subtotal
    isCollapsed?: boolean;

    // Wallpaper Removal
    removalDimensions?: RemovalDimension[];
    removalSqFtRateOption?: number | 'custom';
    removalSqFtRateCustom?: number;
    removalTotalSqFt?: number;
    removalTotalCost?: number;

    // Added per request point #1
    shippingAndTariffs?: number;
    piaSurcharge?: number;
    salesPricePlusSalesTax?: number;
    paperGrandTotal?: number;
}

export interface Room {
    id: string;
    name: string;
    details: RoomSpecificInfo;
    walls: Wall[];
    isCollapsed?: boolean;
}

export interface Project {
    id: string;
    name: string;
    clientInfo: ClientInfo;
    generalProjectInfo: GeneralProjectInfo;
    rooms: Room[];
    isClientInfoCollapsed?: boolean;
    isGeneralProjectInfoCollapsed?: boolean;
}