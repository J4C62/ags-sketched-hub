import { Gtk, Gdk } from "astal/gtk4";
import { bind, Variable } from "astal";
import AstalHyprland from "gi://AstalHyprland";
import { ButtonProps } from "astal/gtk4/widget";

const hyprland = AstalHyprland.get_default();


type WsButtonProps = ButtonProps & {
	ws: AstalHyprland.Workspace;
};

function toRoman(num: number): string {
	const romanNumerals: [number, string][] = [
		[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
		[100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
		[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
	];
	let result = "";
	for (const [value, numeral] of romanNumerals) {
		while (num >= value) {
			result += numeral;
			num -= value;
		}
	}
	return result;
}

function WorkspaceButton({ ws, ...props }: WsButtonProps) {
	const classNames = Variable.derive(
		[bind(hyprland, "focusedWorkspace"), bind(hyprland, "clients")],
		(fws, _) => {
			const classes = ["workspace"];

			const active = fws.id === ws.id;
			active && classes.push("active");

			const occupied = hyprland.get_workspace(ws.id)?.get_clients().length > 0;
			occupied && classes.push("occupied");

			return classes;
		},
	);

	return (
		<button
			cursor={Gdk.Cursor.new_from_name("pointer", null)}
			cssClasses={classNames()}
			onDestroy={() => classNames.drop()}
			valign={Gtk.Align.CENTER}
			halign={Gtk.Align.CENTER}
			onClicked={() => ws.focus()}
			{...props}
		>
			{toRoman(ws.id)}
		</button>);
}


function range(max: number) {
	return Array.from({ length: max + 1 }, (_, i) => i);
}

export default function Workspaces() {
	return (
		<box name="workspace-section" spacing={4}>
			{range(3).map((i) => (
				<WorkspaceButton ws={AstalHyprland.Workspace.dummy(i + 1, null)} />
			))}

		</box>
	);
}


