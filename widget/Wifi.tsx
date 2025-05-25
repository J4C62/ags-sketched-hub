import { Gtk, Gdk } from "astal/gtk4";
import { bind, Variable, execAsync } from "astal";
import AstalNetwork from "gi://AstalNetwork?version=0.1";

const wifi = AstalNetwork.get_default().wifi;
let canReload = Variable(false);

wifi.connect("state-changed", () => {
	if (canReload.get()) {
		reloadWifi();
	}
});

const accessPoints = bind(wifi, "accessPoints");
const loading = Variable(!(accessPoints.get().length === 0));

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
		loading.set(false);
	});
}


function createAccessPointMenuItem(accessPoint: AstalNetwork.AccessPoint) {
	const gestureRightClick = new Gtk.GestureClick({ button: 3 });
	const gestureLeftClick = new Gtk.GestureClick({ button: 1 });
	const classes = ["quick-setting"];

	const isConnected = wifi.ssid === accessPoint.ssid;

	if (isConnected) {
		classes.push("connected");
	}

	gestureRightClick.connect("pressed", () => {
		bash(`nmcli c down "${accessPoint.ssid}"`);
	});

	gestureLeftClick.connect("pressed", () => {
		if (accessPoint.flags & 0x1) {
			showPasswordPrompt(accessPoint.ssid);
		} else {
			bash(`nmcli device wifi connect "${accessPoint.ssid}"`);
		}
	});

	const menubutton = (
		<menubutton cssClasses={classes} cursor={Gdk.Cursor.new_from_name("pointer", null)}>
			<box cssClasses={["ssid-wrapper"]} halign={Gtk.Align.START} spacing={10}>
				<image iconName={accessPoint.iconName} />
				<label>{accessPoint.ssid.slice(0, 20)}</label>
			</box>
		</menubutton>
	);

	menubutton.add_controller(gestureRightClick);
	menubutton.add_controller(gestureLeftClick);

	return menubutton;
}


function sortAndFilter(accessPoints: AstalNetwork.AccessPoint[]) {
	return accessPoints
		.filter((ap) => !!ap.ssid)
		.sort((a, b) => {
			if (wifi.activeAccessPoint === b) return 1;
			if (wifi.activeAccessPoint === a) return -1;
			return b.strength - a.strength;
		});
}

function getLoading() {
	return (
		<revealer reveal={loading}>
			<image iconName="process-working-symbolic" name="spinner" />
		</revealer>
	);
}

const passwordPopover = (
	<popover autohide={false} hasArrow={false} name="popover-wifi">
		<Gtk.ScrolledWindow vexpand name="scrolled-wifi">
			<box hexpand halign={Gtk.Align.CENTER}>
				<centerbox>
					<box vertical spacing={6}>
						{accessPoints.as(sortAndFilter).get().map((accessPoint: AstalNetwork.AccessPoint) =>
							createAccessPointMenuItem(accessPoint)
						)}
					</box>
					<button
						name="refresh-btn"
						cursor={Gdk.Cursor.new_from_name("pointer", null)}
						cssClasses={["qs-button", "refresh"]}
						iconName="view-refresh"
						onClicked={reloadWifi}
						valign={Gtk.Align.START}
						halign={Gtk.Align.END}
					/>
					{getLoading()}
				</centerbox>
			</box>
		</Gtk.ScrolledWindow>
	</popover>
);

export default function Wifi() {
	return (
		<menubutton
			cursor={Gdk.Cursor.new_from_name("pointer", null)}
			cssClasses={["quick-setting"]}
			iconName="network-wireless"
			popover={passwordPopover}
		/>
	);
}
