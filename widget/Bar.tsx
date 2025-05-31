import { App, Astal, Gdk, Gdk } from "astal/gtk4"
import { GLib, Variable } from "astal"
import Workspaces from "./Workspaces"
import Wifi from "./Wifi"
import VolumeWithSlider from "./VolumeWithSlider"

const time = Variable(GLib.DateTime.new_now_local()).poll(1000, () =>

	GLib.DateTime.new_now_local()

)


export default function Bar(gdkmonitor: Gdk.Monitor) {
	const { TOP, LEFT, RIGHT } = Astal.WindowAnchor
	return <window
		setup={self => self.set_default_size(1, 29)}
		visible
		cssClasses={["Bar"]}
		gdkmonitor={gdkmonitor}
		exclusivity={Astal.Exclusivity.EXCLUSIVE}
		anchor={TOP | LEFT | RIGHT}
		application={App}>
		<centerbox cssName="centerbox">
			<Workspaces />
			<box name="clock" cssClasses={["quick-setting"]} horizontal spacing={4}>
				<box>
					<label label={time((t) => t.format("%H:%M")!)} />
				</box>
			</box>

			<box name="quick-settings-btn" spacing={5}>
				<Wifi />
				<box cssClasses={["quick-setting"]}>
					<image iconName={"bluetooth-symbolic"} />
				</box>
				<box cssClasses={["quick-setting"]}>
					<image iconName={"audio-input-microphone-symbolic"} />
				</box>

				<VolumeWithSlider />

			</box>
		</centerbox>
	</window>
}
