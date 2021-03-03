import type { Action } from "./action";
import type { Colour } from "./colour";
import type { Weight } from "./weight";

export interface DrawEvent {
    action: Action,
    metaData?: {
        x: number,
        y: number,
        colour: Colour,
        thickness: Weight
    }
}