import { Gtk, Gdk } from "astal/gtk4";
import { bind, Variable, execAsync } from "astal"
import AstalNetwork from "gi://AstalNetwork?version=0.1";

const wifi = AstalNetwork.get_default().wifi;
let canReload = Variable(false);
wifi.connect("state-changed", () => {
	if (canReload.get()) {
		reloadWifi();
	}
})
const accessPoints = bind(wifi, "accessPoints");
const loading = Variable(!(accessPoints.get().length == 0));
async function bash(strings: string | string[], ...values: unknown[]) {
	const cmd =
		typeof strings === "string"
			? strings
			: strings.flatMap((str, i) => str + `${values[i] ?? ""}`).join("");

	return execAsync(["bash", "-c", cmd]).catch((err) => {
		console.error(cmd, err);
		return "";
	});
}

function reloadWifi() {

	loading.set(true);
	bash("nmcli device wifi rescan").finally(() => {
		loading.set(false)
	})

}
function createAccessPointMenuItem(accessPoint: AstalNetwork.AccessPoint) {
	const gesture = new Gtk.GestureClick({ button: 3 });
	const gesture1 = new Gtk.GestureClick({ button: 1 });
	const classes = ["quick-setting"];

	const isLastSeen = wifi.ssid === accessPoint.ssid;

	gesture.connect("pressed", (gesture) => {
		const connectCommand = `nmcli c down "${accessPoint.ssid}"`;
		bash(connectCommand);
		classes.pop();

	});
	gesture1.connect("pressed", (gesture) => {
		const connectCommand = `nmcli device wifi connect "${accessPoint.ssid}"`;
		bash(connectCommand);
		if (!isLastSeen) {
			const passwordPopover = (menubutton as Gtk.MenuButton).get_popover();
			passwordPopover?.show();
		}
	});
	if (wifi.ssid === accessPoint.ssid) {
		classes.push("active");
	}

	const menubutton = <menubutton
		cssClasses={classes}
		cursor={Gdk.Cursor.new_from_name("pointer", null)}
	>
		<box cssClasses={["ssid-wrapper"]} halign={Gtk.Align.START} spacing={10}>
			<image iconName={accessPoint.iconName} />
			<label>{accessPoint.ssid.slice(0, 20)}</label>
		</box>

	</menubutton>;

	menubutton.add_controller(gesture)
	menubutton.add_controller(gesture1)

	return menubutton;
}

function sortAndFilter(accessPoints: AstalNetwork.AccessPoint[]) {
	return accessPoints
		.filter((ap) => !!ap.ssid)
		.sort((a, b) => {
			if (wifi.activeAccessPoint === b) return 1;
			if (wifi.activeAccessPoint === a) return -1;
			if (b.strength !== a.strength) {
				return b.strength - a.strength;
			}
			return a.strength - b.strength;
		});
}
function getLoading() {
	let content;
	bind(loading).as((isLoading) => {
		if (isLoading) {
			content = <image iconName="process-working-symbolic" name="spinner" />
		}
	})
	return content;


}
export default function Wifi() {
	return <menubutton
		cursor={Gdk.Cursor.new_from_name("pointer", null)}
		cssClasses={["quick-setting"]}
		iconName="network-wireless"
	>
		<popover autohide={false} hasArrow={false} name="popover-wifi">
			<Gtk.ScrolledWindow vexpand name="scrolled-wifi">
				<box hexpand halign={Gtk.Align.CENTER} >

					<centerbox>
						<box vertical spacing={6} >
							{accessPoints.as(sortAndFilter).get().map((accessPoint: AstalNetwork.AccessPoint) =>
								createAccessPointMenuItem(accessPoint)
							)}


						</box>
						<button
							cursor={Gdk.Cursor.new_from_name("pointer", null)}
							cssClasses={["qs-button", "refresh"]}
							iconName="view-refresh"
							onClicked={reloadWifi}
							valign={Gtk.Align.START}
							halign={Gtk.Align.END}
						>
						</button>
						{
							getLoading()
						}

					</centerbox >
				</box>
			</Gtk.ScrolledWindow>
		</popover>
	</menubutton>
}
