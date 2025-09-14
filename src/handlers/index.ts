import { hyprcursorHandler } from "./hyprcursor"
import { mscursorHandler } from "./mscursor"
import { xcursorHandler } from "./xcursor"

export const handler = {
  xcursor: xcursorHandler,
  hyprcursor: hyprcursorHandler,
  mscursor: mscursorHandler,
}
