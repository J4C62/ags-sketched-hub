import { App, Astal, Gdk, Gdk } from "astal/gtk4"
import { GLib, Variable } from "astal"
import Workspaces from "./Workspaces"
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
			<box name="clock" horizontal spacing={3}>
				<label label={time((t) => t.format("%H:%M")!)} />
			</box>

			<box name="quick-settings-btn">
				<box cssClasses={["quick-setting"]}>
					<image iconName={"network-wireless-symbolic"} />
				</box>
				<box cssClasses={["quick-setting"]}>
					<image iconName={"bluetooth-symbolic"} />
				</box>
				<box cssClasses={["quick-setting"]}>
					<image iconName={"audio-input-microphone-symbolic"} />
				</box>
				<box cssClasses={["quick-setting"]}>
					<image iconName={"audio-volume-high-symbolic"} />
				</box>
				<box cssClasses={["quick-setting"]}>
					<image iconName={"x-office-calendar-symbolic"} />
				</box>
			</box>
		</centerbox>
	</window>
}
