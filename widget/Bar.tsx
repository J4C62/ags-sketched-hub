import { App, Astal, Gdk, Gdk } from "astal/gtk4"
import { GLib, Variable } from "astal"
import Workspaces from "./Workspaces"
import Wifi from "./Wifi"
import CavaWidget from "./Cava"
const time = Variable(GLib.DateTime.new_now_local()).poll(1000, () =>
	GLib.DateTime.new_now_local()

)

export default function Bar(gdkmonitor: Gdk.Monitor) {
	const { TOP, LEFT, RIGHT } = Astal.WindowAnchor
	return <window
		visible
		cssClasses={["Bar"]}
		gdkmonitor={gdkmonitor}
		exclusivity={Astal.Exclusivity.EXCLUSIVE}
		anchor={TOP | LEFT | RIGHT}
		application={App}>
		<centerbox cssName="centerbox">
			<Workspaces />
			<box />
			<box name="quick-settings-btn">
				<Wifi />
				<box cssClasses={["quick-setting"]}>
					<image iconName={"bluetooth-symbolic"} />
				</box>
				<box cssClasses={["quick-setting"]}>
					<image iconName={"audio-input-microphone-symbolic"} />
				</box>
				<box cssClasses={["quick-setting"]}>
					<image iconName={"audio-volume-high-symbolic"} />
				</box>
				<box name="clock" cssClasses={["quick-setting"]} horizontal spacing={4}>
					<box>
						<label label={time((t) => t.format("%H:%M")!)} />
					</box>
				</box>
			</box>
		</centerbox>
	</window>
}
