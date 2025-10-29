// --- src/lib/calculations.ts ---
import { RoomSpecificInfo, Wall } from './types';

// Calculation Logic
// Updated signature to accept full RoomSpecificInfo per request point #2
export const calculateWallValues = (wall: Wall, roomDetails?: RoomSpecificInfo): Wall => {

    // --- New Calculation for heightOfWall (Point 2) ---
    const {
        ceilingHeight,
        baseboardHeight,
        verticalCrownHeight,
        chairRailHeight
    } = roomDetails || {};
    const isCeiling = roomDetails?.isCeiling;

    let calculatedHeightOfWall: number | undefined;
    if (ceilingHeight && ceilingHeight > 0) {
        if (chairRailHeight && chairRailHeight > 0) {
            // If Chair Rail exists: Ceiling - Crown - Chair Rail
            calculatedHeightOfWall = ceilingHeight - (verticalCrownHeight || 0) - chairRailHeight;
        } else {
            // If no Chair Rail: Ceiling - Crown - Baseboard
            calculatedHeightOfWall = ceilingHeight - (verticalCrownHeight || 0) - (baseboardHeight || 0);
        }
        calculatedHeightOfWall = Math.max(0, calculatedHeightOfWall); // Ensure it's not negative
    } else {
        // Fallback if no ceiling height is provided in room details
        calculatedHeightOfWall = wall.heightOfWall;
    }
    // --- End of heightOfWall Calculation ---

    const {
        width,
        // heightOfWall, // This is now calculated above
        paperWidthOption, paperWidthCustom,
        lengthOfBoltOption, lengthOfBoltCustom,
        patternVerticalRepeat, patternMatch,
        pricedBy, unitPriceOfWallpaper,
        comparableLengthOfBolt, comparableLengthOfBoltCustom,
        shippingAndTariffs // Added per request point #1
    } = wall;

    let paperWidth = paperWidthOption === 'custom' ? paperWidthCustom : paperWidthOption;
    let lengthOfBolt = lengthOfBoltOption === 'custom' ? lengthOfBoltCustom : lengthOfBoltOption;

    // Use the new calculatedHeightOfWall
    const calculationHeight = calculatedHeightOfWall;

    const verticalHeightOfMatchedRepeat = patternVerticalRepeat && patternMatch ? patternVerticalRepeat * patternMatch : undefined;
    const numberOfCutsForProject = width && paperWidth && paperWidth > 0 ? Math.ceil(width / paperWidth) + 1 : undefined;
    const effectiveHeightForRepeats = calculationHeight !== undefined ? calculationHeight + 4 : undefined;
    const numberOfRepeatsPerCut = effectiveHeightForRepeats && verticalHeightOfMatchedRepeat && verticalHeightOfMatchedRepeat > 0 ? Math.ceil(effectiveHeightForRepeats / verticalHeightOfMatchedRepeat) : (effectiveHeightForRepeats ? 1 : undefined);
    const lengthOfCuts = numberOfRepeatsPerCut && verticalHeightOfMatchedRepeat && verticalHeightOfMatchedRepeat > 0 ? numberOfRepeatsPerCut * verticalHeightOfMatchedRepeat : effectiveHeightForRepeats;
    const totalLengthNeeded = lengthOfCuts && numberOfCutsForProject ? lengthOfCuts * numberOfCutsForProject : undefined; // This is the calculated need
    const numberOfCutLengthsPerBolt = lengthOfBolt && lengthOfCuts && lengthOfCuts > 0 ? Math.floor(lengthOfBolt / lengthOfCuts) : undefined;
    const numberOfBolts = numberOfCutsForProject && numberOfCutLengthsPerBolt && numberOfCutLengthsPerBolt > 0 ? Math.ceil(numberOfCutsForProject / numberOfCutLengthsPerBolt) : undefined;
    const totalLengthPurchased = (lengthOfBolt || 0) * (numberOfBolts || 0);
    const numberOfYardsToOrder = totalLengthPurchased ? Math.ceil(totalLengthPurchased / 36) : undefined;

    const materialCost = (unitPriceOfWallpaper || 0) * (numberOfBolts || 0);

    let compLength = comparableLengthOfBolt === 'custom' ? (comparableLengthOfBoltCustom || 0) : (comparableLengthOfBolt || 0);
    const equivalentProjectSRCalculation = totalLengthNeeded && compLength && compLength > 0
        ? Math.ceil((totalLengthNeeded / compLength) * 2)
        : undefined;

    const baseLabor = equivalentProjectSRCalculation && pricedBy !== undefined ? (typeof pricedBy === 'number' ? equivalentProjectSRCalculation * pricedBy : (materialCost > 0 ? materialCost * 0.38 : 0)) : undefined;

    // Use room's ceilingHeight for surcharge, fallback to calculatedHeightOfWall
    const heightToUseForSurcharge = roomDetails?.ceilingHeight !== undefined && roomDetails.ceilingHeight > 0
        ? roomDetails.ceilingHeight
        : calculationHeight;

    const ceilingSurcharge = (isCeiling && baseLabor !== undefined) ? (baseLabor * 1.5) : 0;

    let heightSurcharge = 0;
    if (heightToUseForSurcharge && heightToUseForSurcharge > 96) {
        heightSurcharge = Math.round((heightToUseForSurcharge - 96) / 12) * 100;
        heightSurcharge = Math.max(0, heightSurcharge);
    }

    const subtotalLabor = baseLabor !== undefined ? baseLabor + heightSurcharge + ceilingSurcharge : undefined;
    const grandTotalLabor = subtotalLabor;

    // --- New Paper Total Calculations (Point 1) ---
    // Assuming (materialCost * 1.2) * 1.06
    const salesPricePlusSalesTax = materialCost > 0 ? (materialCost * 1.2 * 1.06) : 0;
    const paperGrandTotal = salesPricePlusSalesTax + (shippingAndTariffs || 0);
    // --- End of Paper Total Calculations ---

    return {
        ...wall,
        heightOfWall: calculatedHeightOfWall, // Store the calculated height
        verticalHeightOfMatchedRepeat,
        numberOfCutsForProject,
        numberOfRepeatsPerCut,
        lengthOfCuts,
        totalLengthNeeded,
        totalLengthPurchased,
        numberOfCutLengthsPerBolt,
        numberOfBolts,
        numberOfYardsToOrder,
        materialCost,
        equivalentProjectSRCalculation,
        baseLabor,
        heightSurcharge,
        ceilingSurcharge,
        subtotalLabor,
        grandTotalLabor,
        salesPricePlusSalesTax, // Added per request
        paperGrandTotal, // Added per request
        shippingAndTariffs: shippingAndTariffs || 0 // Ensure it's a number
    };
};


// Define field dependencies for highlighting
export const fieldDependencies: Record<string, { inputs: string[], outputs: string[] }> = {
    // This 'width' is now the SUM field
    width: { inputs: ['individualWidths'], outputs: ['numberOfCutsForProject', 'totalLengthNeeded', 'numberOfBolts', 'materialCost', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor', 'salesPricePlusSalesTax', 'paperGrandTotal'] },
    // Added per PDF point #5
    individualWidths: { inputs: [], outputs: ['width', 'numberOfCutsForProject', 'totalLengthNeeded', 'numberOfBolts', 'materialCost', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor', 'salesPricePlusSalesTax', 'paperGrandTotal'] },
    // heightOfWall is now an output of room details
    heightOfWall: { inputs: [/* 'ceilingHeight', 'baseboardHeight', 'verticalCrownHeight', 'chairRailHeight' from RoomDetails */], outputs: ['effectiveHeightForRepeats', 'numberOfRepeatsPerCut', 'lengthOfCuts', 'totalLengthNeeded', 'numberOfBolts', 'materialCost', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'heightSurcharge', 'grandTotalLabor', 'salesPricePlusSalesTax', 'paperGrandTotal'] },
    paperWidthOption: { inputs: [], outputs: ['numberOfCutsForProject', 'totalLengthNeeded', 'numberOfBolts', 'materialCost', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor', 'salesPricePlusSalesTax', 'paperGrandTotal'] },
    paperWidthCustom: { inputs: ['paperWidthOption'], outputs: ['numberOfCutsForProject', 'totalLengthNeeded', 'numberOfBolts', 'materialCost', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor', 'salesPricePlusSalesTax', 'paperGrandTotal'] },
    lengthOfBoltOption: { inputs: [], outputs: ['numberOfCutLengthsPerBolt', 'numberOfBolts', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor', 'salesPricePlusSalesTax', 'paperGrandTotal'] },
    lengthOfBoltCustom: { inputs: ['lengthOfBoltOption'], outputs: ['numberOfCutLengthsPerBolt', 'numberOfBolts', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor', 'salesPricePlusSalesTax', 'paperGrandTotal'] },
    patternVerticalRepeat: { inputs: [], outputs: ['verticalHeightOfMatchedRepeat', 'numberOfRepeatsPerCut', 'lengthOfCuts', 'totalLengthNeeded', 'numberOfBolts', 'materialCost', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor', 'salesPricePlusSalesTax', 'paperGrandTotal'] },
    patternMatch: { inputs: [], outputs: ['verticalHeightOfMatchedRepeat', 'numberOfRepeatsPerCut', 'lengthOfCuts', 'totalLengthNeeded', 'numberOfBolts', 'materialCost', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor', 'salesPricePlusSalesTax', 'paperGrandTotal'] },
    pricedBy: { inputs: [], outputs: ['baseLabor', 'grandTotalLabor'] },
    unitPriceOfWallpaper: { inputs: [], outputs: ['materialCost', 'baseLabor', 'grandTotalLabor', 'salesPricePlusSalesTax', 'paperGrandTotal'] },
    comparableLengthOfBolt: { inputs: [], outputs: ['equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor'] },
    comparableLengthOfBoltCustom: { inputs: ['comparableLengthOfBolt'], outputs: ['equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor'] },

    // Added per request point #1
    shippingAndTariffs: { inputs: [], outputs: ['paperGrandTotal'] },

    // Calculated fields
    verticalHeightOfMatchedRepeat: { inputs: ['patternVerticalRepeat', 'patternMatch'], outputs: ['numberOfRepeatsPerCut', 'lengthOfCuts'] },
    numberOfCutsForProject: { inputs: ['width', 'individualWidths', 'paperWidthOption', 'paperWidthCustom'], outputs: ['totalLengthNeeded', 'numberOfBolts'] },
    numberOfRepeatsPerCut: { inputs: ['heightOfWall', 'verticalHeightOfMatchedRepeat'], outputs: ['lengthOfCuts'] },
    lengthOfCuts: { inputs: ['numberOfRepeatsPerCut', 'verticalHeightOfMatchedRepeat', 'heightOfWall'], outputs: ['totalLengthNeeded', 'numberOfCutLengthsPerBolt'] },
    totalLengthNeeded: { inputs: ['lengthOfCuts', 'numberOfCutsForProject'], outputs: ['equivalentProjectSRCalculation'] },
    totalLengthPurchased: { inputs: ['lengthOfBoltOption', 'lengthOfBoltCustom', 'numberOfBolts'], outputs: ['numberOfYardsToOrder'] },
    numberOfCutLengthsPerBolt: { inputs: ['lengthOfBoltOption', 'lengthOfBoltCustom', 'lengthOfCuts'], outputs: ['numberOfBolts'] },
    numberOfBolts: { inputs: ['numberOfCutsForProject', 'numberOfCutLengthsPerBolt'], outputs: ['materialCost', 'totalLengthPurchased', 'salesPricePlusSalesTax', 'paperGrandTotal'] },

    numberOfYardsToOrder: { inputs: ['totalLengthPurchased'], outputs: [] },
    equivalentProjectSRCalculation: { inputs: ['totalLengthNeeded', 'comparableLengthOfBolt', 'comparableLengthOfBoltCustom'], outputs: ['baseLabor'] },

    materialCost: { inputs: ['unitPriceOfWallpaper', 'numberOfBolts'], outputs: ['baseLabor', 'salesPricePlusSalesTax', 'paperGrandTotal'] },
    baseLabor: { inputs: ['equivalentProjectSRCalculation', 'pricedBy', 'materialCost'], outputs: ['ceilingSurcharge', 'grandTotalLabor'] },
    heightSurcharge: { inputs: ['heightOfWall' /* indirectly roomCeilingHeight */], outputs: ['grandTotalLabor'] },
    ceilingSurcharge: { inputs: ['baseLabor' /* indirectly isCeiling */], outputs: ['grandTotalLabor'] },
    grandTotalLabor: { inputs: ['baseLabor', 'heightSurcharge', 'ceilingSurcharge'], outputs: [] },

    // Added per request point #1
    salesPricePlusSalesTax: { inputs: ['materialCost'], outputs: ['paperGrandTotal'] },
    paperGrandTotal: { inputs: ['salesPricePlusSalesTax', 'shippingAndTariffs'], outputs: [] },
};