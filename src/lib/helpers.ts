// --- src/lib/helpers.ts ---
import {
    ClientInfo,
    GeneralProjectInfo,
    Project,
    Room,
    RoomSpecificInfo,
    Wall
} from './types';
import { calculateWallValues } from './calculations';

// Helper functions to create new entities
export const createNewRoomSpecificInfo = (): RoomSpecificInfo => ({
    paperManufacturer: '',
    paperPatternNumber: '',
    paperColorNumber: '',
    paperProductPhotoLink: '',
    paperType: '',
    paperSpecialRequirements: '',
    ceilingHeight: undefined,
    baseboardHeight: undefined,
    verticalCrownHeight: undefined,
    chairRailHeight: undefined,
    isDetailsCollapsed: false,
    isCeiling: false, // Added per PDF point #3
});

export const createNewWall = (nameSuffix: string | number): Wall => ({
    id: `wall-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: `Space ${nameSuffix}`, // Updated per PDF point #2
    individualWidths: [undefined], // Added per PDF point #5 (starts with one empty input)
    width: undefined, // Sum will be calculated from individualWidths
    paperWidthOption: 20.5,
    lengthOfBoltOption: 180,
    patternMatch: 1,
    pricedBy: 85, // Default updated to '$85 for liner paper'
    heightOfWall: undefined, // Changed from 96, now calculated from Room Details
    comparableLengthOfBolt: 288, // Added per PDF point #7
    isCollapsed: false,
    shippingAndTariffs: undefined, // Added per request point #1
});

export const createNewRoom = (nameSuffix: string | number): Room => ({
    id: `room-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: `Room ${nameSuffix}`,
    details: createNewRoomSpecificInfo(),
    walls: [createNewWall(1)],
    isCollapsed: false,
});

export const createNewClientInfo = (): ClientInfo => ({
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: ''
});

export const createNewGeneralProjectInfo = (): GeneralProjectInfo => ({
    designerBuilderName: '',
    projectManagerName: '',
    projectManagerPhone: '',
    invoiceTo: '',
    notes: '',
    projectType: '',
    roundTripMileage: undefined,
    numberOfDaysForInstall: undefined,
    inputDate: '',
    estimateSentDate: '',
    approvalDate: '',
    orderDate: '',
    orderReceivedDate: '',
    estimatedDateReadyForInstall: '',
    scheduledInstallDate: '',
});

export const createNewProject = (nameSuffix: string | number): Project => {
    const newRoom = createNewRoom(1);
    const newWall = createNewWall(1);
    // Recalculate the wall with potential room ceiling height
    // Updated to pass full details object
    newRoom.walls = [calculateWallValues(newWall, newRoom.details)];

    return {
        id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: `Project ${nameSuffix}`,
        clientInfo: createNewClientInfo(),
        generalProjectInfo: createNewGeneralProjectInfo(),
        rooms: [newRoom],
        isClientInfoCollapsed: false,
        isGeneralProjectInfoCollapsed: false,
    };
};