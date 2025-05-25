
import { Gtk } from "astal/gtk4";
import Cava from "gi://AstalCava";
import { Variable, bind } from "astal";
import cairo from "cairo";
import Mpris from "gi://AstalMpris";

const mpris = Mpris.get_default();
const cava = Cava.get_default();
const bars = Variable([0]);

// Conexión con Cava
if (cava) {
	cava.connect("notify::values", () => {
		const newValues = cava.get_values();
		if (newValues) {
			bars.set(newValues);
		}
	});
}

export default function CavaWidget() {
	if (!cava || !mpris) {
		return (
			<box>
				<label label="No hay visualización disponible" />
			</box>
		);
	}

	const players = mpris.get_players().filter(p => p.available); // ← clave aquí

	return (
		<box spacing={8} vertical name="music-player">
			{players.map((player) => (
				<overlay cssClasses={["cava-widget-container"]}>
					<box cssClasses={["cava-bars-container"]}>
						{bars().as((values) => {
							return values.map((value) => {
								const drawingArea = new Gtk.DrawingArea();
								drawingArea.set_size_request(8, 10);
								drawingArea.set_draw_func((widget, cr, width, height) => {
									if (cr instanceof cairo.Context) {
										cr.setSourceRGB(148 / 255, 226 / 255, 213 / 255);
										const barHeight = value * height;
										cr.rectangle(0, height - barHeight, width, barHeight);
										cr.fill();
									}
									return true;
								});
								return drawingArea;
							});
						})}
					</box>

					<box type="overlay" name="nuclear-info" valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER}>
						<box vertical overflow={Gtk.Overflow.HIDDEN}>
							<box name="nuclear-artist">
								󰝚 {bind(player, "entry")}
							</box>

							<box name="nuclear-title"  >
								<label
									label={bind(player, "title")}
								/>
							</box>

						</box>
					</box>
				</overlay>
			))}
		</box>
	);
}

