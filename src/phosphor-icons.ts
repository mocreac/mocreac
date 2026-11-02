import playFill from "../public/icons/phosphor/play-fill.svg?raw";
import pauseFill from "../public/icons/phosphor/pause-fill.svg?raw";
import sun from "../public/icons/phosphor/sun.svg?raw";
import moon from "../public/icons/phosphor/moon.svg?raw";
import caret_left from "../public/icons/phosphor/caret-left.svg?raw";
import caret_right from "../public/icons/phosphor/caret-right.svg?raw";
import playLight from "../public/icons/phosphor/play-light.svg?raw";
import pauseLight from "../public/icons/phosphor/pause-light.svg?raw";
// Phosphor Icons, Regular (outline): https://github.com/phosphor-icons/core
import crop from "../public/icons/phosphor/crop.svg?raw";
import angle from "../public/icons/phosphor/angle.svg?raw";
import arrow_up_right from "../public/icons/phosphor/arrow-up-right.svg?raw";

import equals from "../public/icons/phosphor/equals.svg?raw";

import push_pin from "../public/icons/phosphor/push-pin.svg?raw";
import speaker_high from "../public/icons/phosphor/speaker-high.svg?raw";
import speaker_slash from "../public/icons/phosphor/speaker-slash.svg?raw";
import play from "../public/icons/phosphor/play.svg?raw";
import pause from "../public/icons/phosphor/pause.svg?raw";
import x from "../public/icons/phosphor/x.svg?raw";
import picture_in_picture from "../public/icons/phosphor/picture-in-picture.svg?raw";
import video_camera from "../public/icons/phosphor/video-camera.svg?raw";

const icons = { playFill, pauseFill, sun, moon, previous: caret_left, next: caret_right, playLight, pauseLight, pin: push_pin, volume: speaker_high, muted: speaker_slash, play, pause, close: x, pip: picture_in_picture, video: video_camera, radius: crop, angle, external: arrow_up_right, result: equals };
export function phosphorIcon(name: keyof typeof icons, size = 18, className = ""): string {
    return icons[name].replace(/<svg[^>]*>/, `<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" class="${className}" width="${size}" height="${size}">`);
}
