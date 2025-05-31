import { Gtk } from "astal/gtk4"
import { bind, Variable, timeout } from "astal"
import AstalWp from "gi://AstalWp";

const showVolumeSlider = Variable(false)
const speaker = AstalWp.get_default()?.audio!.defaultSpeaker!;

export default function VolumeWithSlider() {
	return (
		<box

			name="volume-settings"
			cssClasses={["quick-setting"]}
			onHoverEnter={() => showVolumeSlider.set(true)}
			onHoverLeave={() => showVolumeSlider.set(false)}

		>
			<image iconName="audio-volume-high-symbolic" />

			<revealer
				halign={Gtk.Align.CENTER}
				setup={(self) => {
					self.visible = false;
					showVolumeSlider.subscribe(visible => {
						self.visible = visible;
						timeout(200, () => self.revealChild = visible)
					});

				}}
				transitionType={Gtk.RevealerTransitionType.SWING_UP}
			>
				<slider
					cssClasses={["volume-slider"]}
					widthRequest={160}
					onChangeValue={(self) => {
						speaker.volume = self.value;
					}}
					value={bind(speaker, "volume")}
				/>

			</revealer>

		</box >
	)
}

