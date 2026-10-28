// Phosphor Icons, Regular (outline): https://github.com/phosphor-icons/core
import crop from "../public/icons/phosphor/crop.svg?raw";
import angle from "../public/icons/phosphor/angle.svg?raw";
import arrow_up_right from "../public/icons/phosphor/arrow-up-right.svg?raw";

import equals from "../public/icons/phosphor/equals.svg?raw";

const icons = { radius: crop, angle, external: arrow_up_right, result: equals };
export function phosphorIcon(name: keyof typeof icons, size = 18, className = ""): string {
    return icons[name].replace(/<svg[^>]*>/, `<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" class="${className}" width="${size}" height="${size}">`);
}
