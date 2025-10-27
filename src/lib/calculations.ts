// --- src/lib/calculations.ts ---
import { Wall } from './types';

// Calculation Logic
export const calculateWallValues = (wall: Wall, roomCeilingHeight?: number, isCeiling?: boolean): Wall => {
    const {
        width, heightOfWall,
        paperWidthOption, paperWidthCustom,
        lengthOfBoltOption, lengthOfBoltCustom,
        patternVerticalRepeat, patternMatch,
        pricedBy, unitPriceOfWallpaper,
        // srMultiplierOption, srMultiplierCustom, // Removed
        comparableLengthOfBolt, comparableLengthOfBoltCustom // Added
    } = wall;

    let paperWidth = paperWidthOption === 'custom' ? paperWidthCustom : paperWidthOption;
    let lengthOfBolt = lengthOfBoltOption === 'custom' ? lengthOfBoltCustom : lengthOfBoltOption;
    const calculationHeight = heightOfWall;

    const verticalHeightOfMatchedRepeat = patternVerticalRepeat && patternMatch ? patternVerticalRepeat * patternMatch : undefined;
    // Updated per PDF point #9
    const numberOfCutsForProject = width && paperWidth && paperWidth > 0 ? Math.ceil(width / paperWidth) + 1 : undefined;
    const effectiveHeightForRepeats = calculationHeight !== undefined ? calculationHeight + 4 : undefined;
    const numberOfRepeatsPerCut = effectiveHeightForRepeats && verticalHeightOfMatchedRepeat && verticalHeightOfMatchedRepeat > 0 ? Math.ceil(effectiveHeightForRepeats / verticalHeightOfMatchedRepeat) : (effectiveHeightForRepeats ? 1 : undefined);
    const lengthOfCuts = numberOfRepeatsPerCut && verticalHeightOfMatchedRepeat && verticalHeightOfMatchedRepeat > 0 ? numberOfRepeatsPerCut * verticalHeightOfMatchedRepeat : effectiveHeightForRepeats;
    const totalLengthNeeded = lengthOfCuts && numberOfCutsForProject ? lengthOfCuts * numberOfCutsForProject : undefined; // This is the calculated need
    const numberOfCutLengthsPerBolt = lengthOfBolt && lengthOfCuts && lengthOfCuts > 0 ? Math.floor(lengthOfBolt / lengthOfCuts) : undefined;
    const numberOfBolts = numberOfCutsForProject && numberOfCutLengthsPerBolt && numberOfCutLengthsPerBolt > 0 ? Math.ceil(numberOfCutsForProject / numberOfCutLengthsPerBolt) : undefined;

    // Calculate totalLengthPurchased first, as it's now a dependency for others
    const totalLengthPurchased = (lengthOfBolt || 0) * (numberOfBolts || 0);

    // Updated to use totalLengthPurchased
    const numberOfYardsToOrder = totalLengthPurchased ? Math.ceil(totalLengthPurchased / 36) : undefined;

    const materialCost = (unitPriceOfWallpaper || 0) * (numberOfBolts || 0);

    // const srMultiplier = srMultiplierOption === 'custom' ? (srMultiplierCustom || 0) : (srMultiplierOption || 0); // Removed

    // Updated per PDF point #8
    let compLength = comparableLengthOfBolt === 'custom' ? (comparableLengthOfBoltCustom || 0) : (comparableLengthOfBolt || 0);
    const equivalentProjectSRCalculation = totalLengthNeeded && compLength && compLength > 0
        ? Math.ceil((totalLengthNeeded / compLength) * 2)
        : undefined;

    const baseLabor = equivalentProjectSRCalculation && pricedBy !== undefined ? (typeof pricedBy === 'number' ? equivalentProjectSRCalculation * pricedBy : (materialCost > 0 ? materialCost * 0.38 : 0)) : undefined;

    const heightToUseForSurcharge = roomCeilingHeight !== undefined && roomCeilingHeight > 0
        ? roomCeilingHeight
        : calculationHeight;

    // Added per PDF point #11
    const ceilingSurcharge = (isCeiling && baseLabor !== undefined) ? (baseLabor * 1.5) : 0;

    let heightSurcharge = 0;
    if (heightToUseForSurcharge && heightToUseForSurcharge > 96) {
        // Updated per PDF point #10
        heightSurcharge = Math.round((heightToUseForSurcharge - 96) / 12) * 100;
        heightSurcharge = Math.max(0, heightSurcharge);
    }

    // Updated per PDF point #11
    const subtotalLabor = baseLabor !== undefined ? baseLabor + heightSurcharge + ceilingSurcharge : undefined;
    const travelCharges = 0;
    const grandTotalLabor = subtotalLabor;


    return { ...wall, verticalHeightOfMatchedRepeat, numberOfCutsForProject, numberOfRepeatsPerCut, lengthOfCuts, totalLengthNeeded, totalLengthPurchased, numberOfCutLengthsPerBolt, numberOfBolts, numberOfYardsToOrder, materialCost, equivalentProjectSRCalculation, baseLabor, heightSurcharge, ceilingSurcharge, subtotalLabor, travelCharges, grandTotalLabor, };
};


// Define field dependencies for highlighting
export const fieldDependencies: Record<string, { inputs: string[], outputs: string[] }> = {
    // This 'width' is now the SUM field
    width: { inputs: ['individualWidths'], outputs: ['numberOfCutsForProject', 'totalLengthNeeded', 'numberOfBolts', 'materialCost', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor'] },
    // Added per PDF point #5
    individualWidths: { inputs: [], outputs: ['width', 'numberOfCutsForProject', 'totalLengthNeeded', 'numberOfBolts', 'materialCost', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor'] },
    heightOfWall: { inputs: [], outputs: ['effectiveHeightForRepeats', 'numberOfRepeatsPerCut', 'lengthOfCuts', 'totalLengthNeeded', 'numberOfBolts', 'materialCost', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'heightSurcharge', 'grandTotalLabor'] },
    paperWidthOption: { inputs: [], outputs: ['numberOfCutsForProject', 'totalLengthNeeded', 'numberOfBolts', 'materialCost', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor'] },
    paperWidthCustom: { inputs: ['paperWidthOption'], outputs: ['numberOfCutsForProject', 'totalLengthNeeded', 'numberOfBolts', 'materialCost', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor'] },
    lengthOfBoltOption: { inputs: [], outputs: ['numberOfCutLengthsPerBolt', 'numberOfBolts', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor'] },
    lengthOfBoltCustom: { inputs: ['lengthOfBoltOption'], outputs: ['numberOfCutLengthsPerBolt', 'numberOfBolts', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor'] },
    patternVerticalRepeat: { inputs: [], outputs: ['verticalHeightOfMatchedRepeat', 'numberOfRepeatsPerCut', 'lengthOfCuts', 'totalLengthNeeded', 'numberOfBolts', 'materialCost', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor'] },
    patternMatch: { inputs: [], outputs: ['verticalHeightOfMatchedRepeat', 'numberOfRepeatsPerCut', 'lengthOfCuts', 'totalLengthNeeded', 'numberOfBolts', 'materialCost', 'totalLengthPurchased', 'numberOfYardsToOrder', 'equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor'] },
    pricedBy: { inputs: [], outputs: ['baseLabor', 'grandTotalLabor'] },
    unitPriceOfWallpaper: { inputs: [], outputs: ['materialCost', 'baseLabor', 'grandTotalLabor'] },
    // srMultiplierOption: { inputs: [], outputs: ['equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor'] }, // Removed
    // srMultiplierCustom: { inputs: ['srMultiplierOption'], outputs: ['equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor'] }, // Removed
    // Added per PDF point #7
    comparableLengthOfBolt: { inputs: [], outputs: ['equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor'] },
    comparableLengthOfBoltCustom: { inputs: ['comparableLengthOfBolt'], outputs: ['equivalentProjectSRCalculation', 'baseLabor', 'grandTotalLabor'] },

    // Calculated fields
    verticalHeightOfMatchedRepeat: { inputs: ['patternVerticalRepeat', 'patternMatch'], outputs: ['numberOfRepeatsPerCut', 'lengthOfCuts'] },
    numberOfCutsForProject: { inputs: ['width', 'individualWidths', 'paperWidthOption', 'paperWidthCustom'], outputs: ['totalLengthNeeded', 'numberOfBolts'] },
    numberOfRepeatsPerCut: { inputs: ['heightOfWall', 'verticalHeightOfMatchedRepeat'], outputs: ['lengthOfCuts'] },
    lengthOfCuts: { inputs: ['numberOfRepeatsPerCut', 'verticalHeightOfMatchedRepeat', 'heightOfWall'], outputs: ['totalLengthNeeded', 'numberOfCutLengthsPerBolt'] },
    // Updated per PDF point #8
    totalLengthNeeded: { inputs: ['lengthOfCuts', 'numberOfCutsForProject'], outputs: ['equivalentProjectSRCalculation'] },
    // Updated per PDF point #8
    totalLengthPurchased: { inputs: ['lengthOfBoltOption', 'lengthOfBoltCustom', 'numberOfBolts'], outputs: ['numberOfYardsToOrder'] },
    numberOfCutLengthsPerBolt: { inputs: ['lengthOfBoltOption', 'lengthOfBoltCustom', 'lengthOfCuts'], outputs: ['numberOfBolts'] },
    numberOfBolts: { inputs: ['numberOfCutsForProject', 'numberOfCutLengthsPerBolt'], outputs: ['materialCost', 'totalLengthPurchased'] },

    // Updated inputs per PDF point #8
    numberOfYardsToOrder: { inputs: ['totalLengthPurchased'], outputs: [] },
    // Updated inputs per PDF point #8
    equivalentProjectSRCalculation: { inputs: ['totalLengthNeeded', 'comparableLengthOfBolt', 'comparableLengthOfBoltCustom'], outputs: ['baseLabor'] },

    materialCost: { inputs: ['unitPriceOfWallpaper', 'numberOfBolts'], outputs: ['baseLabor'] },
    // Updated per PDF point #11
    baseLabor: { inputs: ['equivalentProjectSRCalculation', 'pricedBy', 'materialCost'], outputs: ['ceilingSurcharge', 'grandTotalLabor'] },
    heightSurcharge: { inputs: ['heightOfWall' /* indirectly roomCeilingHeight */], outputs: ['grandTotalLabor'] },
    // Added per PDF point #11
    ceilingSurcharge: { inputs: ['baseLabor' /* indirectly isCeiling */], outputs: ['grandTotalLabor'] },
    // Updated per PDF point #11
    grandTotalLabor: { inputs: ['baseLabor', 'heightSurcharge', 'ceilingSurcharge'], outputs: [] },
};